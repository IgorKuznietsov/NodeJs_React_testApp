
let username = sessionStorage.getItem('username');
let sessionId = sessionStorage.getItem('sessionId' );

if(!username) {username = ''}
if(!sessionId) {sessionId = ''}

const initState = {
	username: username,
	sessionId: sessionId,
	isFetchingAccess: false
}

export default (prevState = initState, action) => {
	switch (action.type) {
		case 'LOGOUT':
			return {...prevState, sessionId: null}
		case 'START_AUTH_REQUEST':
			return {...prevState, isFetchingAccess: true}
		case 'ACCESS_GRANTED':
			return {
				...prevState, 
				isFetchingAccess: false, 
				sessionId: action.payload.sessionId, 
				username: action.payload.username
			}
		case 'ACCESS_DENIED':
			return {...prevState, isFetchingAccess: false, sessionId: null}
		default: 
			return prevState
	}   
}