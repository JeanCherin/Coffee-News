var express = require('express');
var router = express.Router();
var request = require('sync-request');

var uid2 = require('uid2')
var bcrypt = require('bcrypt');

var userModel = require('../models/users')
var articleModel = require('../models/articles')


router.post('/sign-up', async function (req, res, next) {

  var error = []
  var result = false
  var saveUser = null
  var token = null


  const data = await userModel.findOne({
    email: req.body.emailFromFront
  })

  if (data != null) {
    error.push('utilisateur déjà présent')
  }

  if (req.body.usernameFromFront == ''
    || req.body.emailFromFront == ''
    || req.body.passwordFromFront == ''
  ) {
    error.push('champs vides')
  }


  if (error.length == 0) {

    var hash = bcrypt.hashSync(req.body.passwordFromFront, 10);
    var newUser = new userModel({
      username: req.body.usernameFromFront,
      email: req.body.emailFromFront,
      password: hash,
      token: uid2(32),
      lang: 'fr',
    })

    saveUser = await newUser.save()


    if (saveUser) {
      result = true
      token = saveUser.token
    }
  }


  res.json({ result, saveUser, error, token })
})

router.post('/sign-in', async function (req, res, next) {

  var result = false
  var user = null
  var error = []
  var token = null

  if (req.body.emailFromFront == ''
    || req.body.passwordFromFront == ''
  ) {
    error.push('champs vides')
  }

  if (error.length == 0) {
    const user = await userModel.findOne({
      email: req.body.emailFromFront,
    })


    if (user) {
      if (bcrypt.compareSync(req.body.passwordFromFront, user.password)) {
        result = true
        token = user.token
      } else {
        result = false
        error.push('mot de passe incorrect')
      }

    } else {
      error.push('email incorrect')
    }
  }


  res.json({ result, user, error, token })


})

router.post('/wishlist-article', async function (req, res, next) {
  var result = false

  var user = await userModel.findOne({ token: req.body.token })

  if (user != null) {
    var newArticle = new articleModel({
      title: req.body.name,
      description: req.body.desc,
      urlToImage: req.body.img,
      content: req.body.content,
      lang: req.body.lang,
      userId: user._id,
    })

    var articleSave = await newArticle.save()

    if (articleSave.title) {
      result = true
    }
  }

  res.json({ result })
})

router.delete('/wishlist-article', async function (req, res, next) {
  var result = false
  var user = await userModel.findOne({ token: req.body.token })

  if (user != null) {
    var returnDb = await articleModel.deleteOne({ title: req.body.title, userId: user._id })

    if (returnDb.deletedCount == 1) {
      result = true
    }
  }

  res.json({ result })
})


router.get('/wishlist-article', async function (req, res, next) {
  var articles = []
  var user = await userModel.findOne({ token: req.query.token })

  if (user != null) {
    if (req.query.lang !== '') {
      articles = await articleModel.find({ userId: user._id, lang: req.query.lang })
    } else {
      articles = await articleModel.find({ userId: user._id })
    }

  }

  res.json({ articles })
})

router.get('/user-lang', async function (req, res, next) {
  var lang = null
  var user = await userModel.findOne({ token: req.query.token })

  if (user != null) {
    lang = user.lang
  }

  res.json({ lang })
})

router.post('/user-lang', async function (req, res, next) {
  var result = false
  var user = await userModel.updateOne({ token: req.body.token }, { lang: req.body.lang })

  if (user != null) {
    result = true
  }

  res.json({ result })
})

router.post('/get-sources', async function (req, res, next) {
  const api_key = process.env.API_KEY;
  var data;
  var dataAPI;

  if (req.body.langue && req.body.country) {
    data = await request("GET", `https://newsapi.org/v2/sources?language=${req.body.langue}&country=${req.body.country}&apiKey=${api_key}`);
    dataAPI = JSON.parse(data.body)
  } else {
    data = await request("GET", `https://newsapi.org/v2/top-headlines?sources=${req.body.id}&apiKey=${api_key}`);
    dataAPI = JSON.parse(data.body)
  }
  
  res.json({ dataAPI })
})

module.exports = router;
