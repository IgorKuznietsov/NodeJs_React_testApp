import React, { Component } from 'react';
import { connect } from 'react-redux'
import { logout } from '../App'

import { Link } from 'react-router-dom'

const getGoodsURL = 'http://localhost:3010/get_goods'

function updateGoods(goods, parent) {
	return {type: 'UPDATE_GOODS', payload: {goods, parent}}
}

function getGoods(username, sessionId, classifier, parent) {
	return (dispatch) => {
		dispatch({type: 'FETCHING_GOODS'})
		fetch(getGoodsURL, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({username, sessionId, classifier, parent})})
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
				console.log(res)
				dispatch(updateGoods(res, parent))
			}
		})
		.catch((err) => console.log(err))
	}
}

class CategoryRow extends Component {

	constructor(props){
		super(props)
		this.state = {isOpen: props.isOpen}
	}
	toggleIsOpen() {
		this.setState({isOpen: !this.state.isOpen})
		if (!this.isOpen) {
			this.props.getGoods(this.props.username, this.props.sessionId, this.props.match.params.id, this.props.id)
		}
	}

	render() {

		let childElements = (this.props.categories.map( (category) => { 
			return (<CategoryRow 
				key = {category.id} 
				id = {category.id} 
				name = {category.name} 
				isOpen = {category.isOpen} 
				categories = {category.categories}  
				products = {category.products}
				getGoods = {this.props.getGoods}
			/>)
		} ) + 
		this.props.goods.products.map( (product) => { 
			return (<ProductRow 
				id = {product.id} 
				key = {product.key} 
				name = {product.name} 
			/>)
		} )
)
		return (
			<div>
				<div onClick = {this.toggleIsOpen}>
					{this.state.isOpen ? '-' : '+'}
					{this.props.name}
					{this.props.id}
				</div>	
				{this.state.isOpen ? childElements : null}
			</div>
		)
	}
}

class ProductRow extends Component {
	render() {
		return (
			<div>
				<Link to = {'/goods/' + this.props.id}>
					{this.props.name}
					{this.props.id}
				</Link>	
			</div>
		)
	}
}


class ClassifierPage extends Component {
	componentDidMount() {
		//fetching goods	for root group and one level deeper
		this.props.getGoods(this.props.username, this.props.sessionId, this.props.match.params.id, '')
	}

	/*componentDidUpdate() {
		this.props.goods.categories.map( (category) => {
			if (!category.isOpen && !category.updated) {
				this.props.getGoods(this.props.username, this.props.sessionId, this.props.match.params.id, category.id)
			}
		}) 
	}*/

  render() {
	  console.log(this.props.goods)
	return(
      <div>
        CLASSIFIER PAGE {this.props.match.params.id}

				{this.props.goods.get('categories').map( (category) => { 
					return <CategoryRow 
						key = {category.id} 
						id = {category.id} 
						name = {category.name} 
						isOpen = {category.isOpen} 
						categories = {category.categories}  
						products = {category.products}
						getGoods = {this.props.getGoods}
					/>
				} )}
				{this.props.goods.get('products').map( (product) => { 
					return <ProductRow 
						key = {product.id} 
						id = {product.id} 
						name = {product.name} 
					/>
				} )}

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
	sessionId: state.auth.sessionId, 
	username: state.auth.username,
	goods: state.goods.goods
})

const mapDispatchToProps = (dispatch) => ({
	logout: () => {dispatch(logout())},
	getGoods: (username, sessionId, classifier, parent) => {dispatch(getGoods(username, sessionId, classifier, parent))}
})

export default connect(mapStateToProps, mapDispatchToProps)(ClassifierPage)