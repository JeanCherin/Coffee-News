import React,{useState, useEffect} from 'react';
import {Link} from 'react-router-dom'
import './App.css';
import { List, Avatar} from 'antd';
import Nav from './Nav'
import { connect } from 'react-redux';

function ScreenSource(props) {

  const [sourceList, setSourceList] = useState([])
  const [selectedLang, setSelectedLang] = useState(props.selectedLang)

  useEffect(() => {
    const findLang = async() => {
      
      const reqFind = await fetch(`/user-lang?token=${props.token}`)
      const resultFind = await reqFind.json()

      setSelectedLang(resultFind.lang)
    }

    findLang()
  }, [])

  useEffect(() => {
    const APIResultsLoading = async() => {
      var langue = 'fr'
      var country = 'fr'
        
      if(selectedLang == 'en'){
        var langue = 'en'
        var country = 'us'
      }
      props.changeLang(selectedLang)
      const data = await fetch(`https://newsapi.org/v2/sources?language=${langue}&country=${country}&apiKey=702710c211d14811af5d9bc494b9bd1a`)
      const body = await data.json()
      setSourceList(body.sources)
    }

    APIResultsLoading()
  }, [selectedLang])

  var updateLang = async (lang) => {
    setSelectedLang(lang)

    const reqLang = await fetch('/user-lang', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: `lang=${lang}&token=${props.token}`
    })
  }

  var styleBorderFr = {width:'40px', margin:'10px',cursor:'pointer'}

  if(selectedLang == 'fr'){
    styleBorderFr.border = '1px solid black'
  }

  var styleBorderEn = {width:'40px', margin:'10px',cursor:'pointer'}

  if(selectedLang == 'en'){
    styleBorderEn.border = '1px solid black'
  }

  return (
    <div>
        <Nav/>
       
       <div style={{display:'flex', justifyContent:'center', alignItems:'center'}} className="Banner">
          <img style={styleBorderFr} src='/images/fr.png' onClick={() => updateLang('fr')} />
          <img style={styleBorderEn} src='/images/uk.png' onClick={() => updateLang('en')} /> 
        </div>

       <div className="HomeThemes">
          
              <List
                  itemLayout="horizontal"
                  dataSource={sourceList}
                  renderItem={source => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={`/images/${source.category}.png`} />}
                        title={<Link to={`/screenarticlesbysource/${source.id}`}>{source.name}</Link>}
                        description={source.description}
                      />
                    </List.Item>
                  )}
                />


          </div>
                 
      </div>
  );
}

function mapStateToProps(state){
  return {selectedLang: state.selectedLang, token: state.token}
}

function mapDispatchToProps(dispatch){
  return {
    changeLang: function(selectedLang){
      dispatch({type: 'changeLang', selectedLang: selectedLang})
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScreenSource)
