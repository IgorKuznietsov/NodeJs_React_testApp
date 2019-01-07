import React, { Component } from 'react'
import {BrowserRouter as Router, Link, Route} from 'react-router-dom'
import Product from './Product'


const goodsURL = 'http://localhost:3010/goods'

function updateChildren(parentId, children) {
	return {type: 'UPDATE_CHILDREN', payload: {parentId, children}}
}

function fetchGoods(parentId) {
	return (dispatch) => {
		fetch(goodsURL, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
    	body: JSON.stringify({parentId})
		})
		.then((res) => {
			if (!res.ok){ Promise.reject(new Error('wrong server response'))}
			return res
		})
		.then((res) => res.json())
		.then((res) => {
			dispatch(updateChildren(parentId, res))
		})
	}

}

class GoodsPage extends Component {
	componentDidMount(){
		console.log('GoodsPage DidMount')
	}

	render() {
		return(
			<div>
				GOODS PAGE
				<Router>
					<div>
						{this.props.match.url}
						<Link to = '/goods/123'>123</Link>
						<Route path = '/goods/:id' component = {Product} />  
					
					</div>
				</Router>
			</div>
		)
	}
}

export default GoodsPage