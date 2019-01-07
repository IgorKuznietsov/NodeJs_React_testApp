import React, { Component } from 'react';
import { connect } from 'react-redux'
import { requestClassifiers, logout } from '../App'

const saveClassifierURL = 'http://localhost:3010/save_classifier'

function saveClassifier(id, name, username, sessionId) {
  return (dispatch) => {
		console.log('username' + username)
    fetch(saveClassifierURL, {
			method: 'POST',
			headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, sessionId, id, name})})
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
			if (res.id){
				dispatch(requestClassifiers(username, sessionId))
			}
		})
		.catch((err) => console.log(err))
	}
}


class ClassifierEditingPage extends Component {
   
    render() {
        return(
        <div>
            ClassifierPage {this.props.match.params.id}
            <ClassifierEditingForm
                key = {this.props.match.params.id + '_' + this.props.classifiers.length} 
                id = {this.props.match.params.id} 
                classifiers = {this.props.classifiers} 
                saveClassifier = {this.props.saveClassifier}
                sessionId = {this.props.sessionId}
                username = {this.props.username}
                history = {this.props.history}
                />
        </div>
        )
    }
}

class ClassifierEditingForm extends React.Component {

    constructor(props) {
        super(props)

        let name = ''
        let id = ''
        let disabled = false
        if (props.id !== '_new') {
            let classifier = props.classifiers.find((el) => (el.id === props.id))
            if (classifier) {
                name = classifier.name
                id = classifier.id
            } else {
                disabled = true    
            }
        }
				this.state = {name, id, disabled}
        this.handleNameChange = this.handleNameChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleNameChange(e) {
        this.setState({name: e.target.value})
    }

    handleSubmit(e) {
        e.preventDefault()
		console.log('this.props.sessionId' + this.sessionId)
        this.props.saveClassifier(this.state.id, this.state.name, this.props.username, this.props.sessionId)
        this.props.history.push('/goods/classifiers')
    }


    render() {
        return ( 
            <form>
                name: <input type = 'text' disabled = {this.state.disabled} onChange = {this.handleNameChange} value = {this.state.name}/>
                id: {this.state.id}
                <button onClick = {this.handleSubmit} type = 'submit' disabled = {this.state.disabled}>SAVE</button>
            </form>
        )
    }
    
}

const mapStateToProps = (state) => ({
	classifiers: state.goods.classifiers,
	sessionId: state.auth.sessionId,
	username: state.auth.username
})

const mapDispatchToProps = (dispatch) => ({
	saveClassifier: (id, name, username, sessionId) => {dispatch(saveClassifier(id, name, username, sessionId))},
	requestClassifiers: (username, sessionId) => {dispatch(requestClassifiers(username, sessionId))}
} )

export default connect(mapStateToProps, mapDispatchToProps)(ClassifierEditingPage) 