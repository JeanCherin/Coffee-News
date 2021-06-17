var mongoose = require('mongoose')

var articleSchema = mongoose.Schema({
    title: String,
    description: String,
    content: String,
    urlToImage: String,
    lang: String,
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
})

var articleModel = mongoose.model('articles', articleSchema)

module.exports = articleModel