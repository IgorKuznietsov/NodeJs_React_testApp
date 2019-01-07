import { connect } from 'react-redux'
import React, { Component } from 'react'
import './NavPanelHeader.css'

class NavPanelHeader extends Component {

	handleLogout(e) {
		e.preventDefault()
		this.props.logout()
	}

	render() {
		const username = this.props.username
		return(
			<div className = 'NavPanelHeader'>
				You signed as {username}
				<button onClick = {this.handleLogout.bind(this)} >
					Logout
				</button>
			</div>
		)
	}
}

function logout() {
	return {type: 'LOGOUT'}
}

function clearCredentials() {
	sessionStorage.removeItem('sessionId')
	sessionStorage.removeItem('username')
}
const mapStateToProps = (state) => ({username: state.auth.username})

const mapDispatchToProps = (dispatch) => ({logout: () => {
	dispatch(logout())
	clearCredentials()
}} )

export default connect(mapStateToProps, mapDispatchToProps)(NavPanelHeader)