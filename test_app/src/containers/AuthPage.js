import { connect } from 'react-redux'
import React, { Component } from 'react'
import './AuthPage.css'

class AuthPage extends Component {

    handleSubmit(e) {
      e.preventDefault()
      const username = e.target[0].value
      const password = e.target[1].value
      this.props.login(username, password)
    }
  
    render() {
      return(
        <div>
          LOGIN PAGE
          <form onSubmit = {this.handleSubmit.bind(this)} >
          <input type = 'text' placeholder = 'login'></input>
          <input type = 'password' placeholder = 'password'></input>
          <button type = 'submit'>LOGIN</button>
          </form>
        </div>
      )
    }
}

function startAuthRequest() {
	return {type: 'START_AUTH_REQUEST'}
}

function accessGranted(sessionId, username) {
	return {
		type: 'ACCESS_GRANTED', 
		payload: {sessionId, username}
	}
}

function accessDenied() {
	return {
		type: 'ACCESS_GRANTED' 		
	}
}

const authURL = 'http://localhost:3010/auth'

function login(username, password) {
	return (dispatch) => {
		dispatch(startAuthRequest())
		let req = {username, password}
		console.log(req)
		fetch(authURL, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
    	body: JSON.stringify(req)
		})
		.then((res) => {
			if (!res.ok){ Promise.reject(new Error('wrong server response'))}
			return res
		})
		.then((res) => res.json())
		.then((res) => {
			if (res.sessionId){
				dispatch(accessGranted(res.sessionId, username))
				sessionStorage.setItem('sessionId', res.sessionId)
				sessionStorage.setItem('username', username)
			} else {
				dispatch(accessDenied())
				sessionStorage.removeItem('sessionId')
				sessionStorage.removeItem('username')
			}
		})
		.catch((err) => console.log(err))
	}
}

const mapStateToProps = (state) => ({state: state})

const mapDispatchToProps = (dispatch) => ({login: (username, password) => {dispatch(login(username, password))}} )

export default connect(mapStateToProps, mapDispatchToProps)(AuthPage)