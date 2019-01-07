import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Link, Redirect, Switch } from 'react-router-dom'

import { createStore, applyMiddleware } from 'redux'
import { Provider, connect} from 'react-redux'
import thunk from 'redux-thunk'
import AuthPage from './containers/AuthPage'
import NavPanelHeader from './containers/NavPanelHeader'
import GoodsPage from './containers/GoodsPage'
import ClassifiersPage from './containers/ClassifiersPage'
import ClassifierPage from './containers/ClassifierPage'
import ClassifierEditingPage from './containers/ClassifierEditingPage'

import rootReducer from './reducers'


const store = createStore(rootReducer, applyMiddleware(thunk))

export function logout() {
  return {type: 'LOGOUT'}
}


function updateClassifiers(classifiers) {
  return {type: 'CLASSIFIERS_FETCHED', payload: classifiers}
}

const getClassifiersURL = 'http://localhost:3010/get_classifiers'

export function requestClassifiers(username, sessionId) {
  return (dispatch) => {
    
    fetch(getClassifiersURL, {
			method: 'POST',
			headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
      },
    	body: JSON.stringify({username, sessionId})})
    .then((res) => {
      if (res.status === 401) {
        dispatch(logout())
        return Promise.reject()
      }
			if (!res.ok){ return Promise.reject(new Error('wrong server response'))}
			return res
		})
		.then((res) => res.json())
		.then((res) => {
			if (res){
				dispatch(updateClassifiers(res))
      }
		})
		.catch((err) => console.log(err))
  }
}


class AuthRouter extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path = '/login' component = {AuthPage}/>
          <Redirect to = '/login'/>
        </Switch>
      </Router>
      ) 
  }
}

class MainRouter extends Component {
  componentDidMount() {
    this.props.requestClassifiers(this.props.username, this.props.sessionId)
  }

  handleLogout(e) {
    this.props.logout()
  } 

  render() {
    return (
      <Router>
      <div className = 'RootContainer'>
        <div className = 'navPanel'>
          <NavPanelHeader />
          
          <Link to = '/login'> login </Link>
          <Link to = '/goods'> goods </Link>
          <Link to = '/goods/classifiers'> > classifiers </Link>
          {this.props.classifiers.map( (classifier) => (
            <Link to = {'/goods/classifier/' + classifier.id} key = {classifier.id}> >> {classifier.name}</Link>
          ) )}
          <Link to = '/shops'> shops </Link>

        </div>

        <div className = 'workSpace'>
          <div>
            {/*<Redirect from = '/' to = '/login'/>*/}
            <Route exact path = '/' component = {Home}/>
            <Route path = '/login' component = {AuthPage}/>
            <Route exact path = '/goods' component = {GoodsPage}/>
            <Route exact path = '/goods/classifiers' component = {ClassifiersPage}/>
            <Route exact path = '/goods/classifiers/:id' component = {ClassifierEditingPage}/>
            <Route exact path = '/goods/classifier/:id' component = {ClassifierPage}/>
            <Route path = '/shops' component = {ShopsPage}/>
            
          </div>
        </div>
      </div>
    
    </Router>
      ) 
  }
}

class App extends Component {

  render() {
    if(!this.props.sessionId){
      return <AuthRouter/>
    } 
    return ( 
      <MainRouter 
        logout = {this.props.logout} 
        classifiers = {this.props.classifiers} 
        requestClassifiers = {this.props.requestClassifiers} 
        username = {this.props.username}
        sessionId = {this.props.sessionId}
        />
      )
  }
}

class ShopsPage extends Component {
  render() {
    return(
      <div>
        SHOPS PAGE
      </div>
    )
  }
}





class Home extends Component {
  render() {
    return(
      <div>
        Home PAGE
      </div>
    )
  }
}

const mapStateToProps = (state) => ({sessionId: state.auth.sessionId, classifiers: state.goods.classifiers, username: state.auth.username})

const mapDispatchToProps = (dispatch) => ({
  logout: () => {dispatch(logout())},
  requestClassifiers: (username, sessionId) => {dispatch(requestClassifiers(username, sessionId))}
})

const ConnectedApp = connect(mapStateToProps, mapDispatchToProps)(App)

const Application = () => {
  return (
    <Provider store = {store}>
      <ConnectedApp />
    </Provider>
  )
}

export default Application;
