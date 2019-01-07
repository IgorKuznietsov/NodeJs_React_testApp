import auth from './auth'
import goods from './goods'
import { combineReducers } from 'redux'

/*
const initState = {
	authorized: false,
	username: '',
	//sessionId: null,
	editableProduct: null,
	editableCategory: null,
	goods: []
}*/

export default combineReducers({auth, goods})