import { Map, List } from 'immutable'

const initState = {
	classifiers: [],
	goods: Map({categories: List([]), products: List([])}),
	editableProduct: null,
	activeCategory: null,
	categoriesPath: []
}

export default (prevState = initState, action) => {
	switch (action.type) {
		case 'CLASSIFIERS_FETCHED':
			return {...prevState, classifiers: action.payload}
		case 'UPDATE_GOODS':
			const newGoods = updateGoods(prevState.goods, action.payload.parent, action.payload.goods)
			
			return {...prevState, goods: newGoods}
		default: 
			return prevState
	}   
}

function updateGoods(prevGoods, parent, fetchedGoods) {
	//recursion
	if (parent == null) {
		let prevProducts = prevGoods.get('products')
		fetchedGoods.products.map( (fetchedProduct) => {
			let existingProductIndex = prevProducts.findIndex( (product) => (product.get('id') === fetchedProduct.id) ) 
			if (existingProductIndex !== -1) {
				let existingProduct = prevProducts.get(existingProductIndex)
				if (existingProduct.get('name') !== fetchedProduct.name) {
					prevProducts = prevProducts.setIn([existingProductIndex, 'name'], fetchedProduct.name)
				}
			} else {
				prevProducts = prevProducts.push( Map({id: fetchedProduct.id, name: fetchedProduct.name}) )
			}	
		})
		let prevCategories = prevGoods.get('categories')

		fetchedGoods.categories.map( (fetchedCategory) => {
			let existingCategoryIndex = prevCategories.findIndex( (category) => (category.get('id') === fetchedCategory.id) ) 
			if (existingCategoryIndex !== -1) {
				let existingCategory = prevProducts.get(existingCategoryIndex)
				if (existingCategory.get('name') !== fetchedCategory.name) {
					prevCategories = prevProducts.setIn([existingCategoryIndex, 'name'], fetchedCategory.name)
				}
			} else {
				prevCategories = prevCategories.push( Map({id: fetchedCategory.id, name: fetchedCategory.name, isOpen: false}) )
			}	
		})

		return Map({products: prevProducts, Categories: prevCategories})
	}
}