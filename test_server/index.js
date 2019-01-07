express  = require ('express')
const { Pool } = require('pg')
bodyParser = require('body-parser')
const redis = require('redis')

const app = express()
const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'test',
	password: '123'
})



const crypto = require("crypto")

const sessionLifeTime = 100

const redisClient = redis.createClient()

function newGUID() {
	return crypto.randomBytes(16).toString('hex')
}

redisClient.on('connect', () => {
	console.log('redis client connected')
})

redisClient.on('error', function (err) {
    console.log('Something went wrong ' + err);
})

app.use(bodyParser.json())

app.use((req, res, next) => {
	if (req.path == '/auth'){
		next()
		return
	}
	if (req.method == 'OPTIONS') {
		res.end('POST')
		return
	}
	let username = req.body.username
	let sessionId = req.body.sessionId
	if (!username || !sessionId){
		res.status(401).end()
		return
	}
	redisClient.get(username, (err, result) => {
		if (err) {
			console.log(err)
			return
		}
		
		if (result == sessionId){
			redisClient.expire(username, sessionLifeTime)
			next()
		} else {
			res.status(401).end()
		}
	})
})



app.post('/auth', (req, res) => {
	pool.query('SELECT username, password FROM public.users WHERE username = $1 AND password = $2 ', [req.body.username, req.body.password])
	.then((queryResult) => {
		if(queryResult.rowCount){
			const sessionId = newGUID()
			redisClient.set(req.body.username, sessionId)
			redisClient.expire(req.body.username, sessionLifeTime)
			res.end(JSON.stringify({sessionId}))
		}
		res.end(queryResult.rows.length)
	})
	.catch(() => {res.end('hm, something went wrong')})
})

app.post('/get_classifiers', (req, res) => {
	console.log('a')
	pool.query('SELECT id, name FROM public.classifiers')
	.then((queryResult) => {
		res.json(queryResult.rows)
	})
	.catch((err) => {
		console.log(err)
		res.status(500).end()
	})
})

app.post('/save_classifier', (req, res) => {

	let id = req.body.id
	let query = `UPDATE public.classifiers SET name = $2 WHERE id = $1`
	if (!id) {
		id = newGUID()
		query = `INSERT INTO public.classifiers (id, name) VALUES ($1, $2) `
	} 

	pool.query(query, [id, req.body.name])
	.then(() => {
		res.json({id})
	})
	.catch((err) => {
		console.log(err)
		res.status(500).end()
	})
})



app.post('/save_category', (req, res) => {
	let id = req.body.id
	if (!id) {id = newGUID()} 

	pool.query(`IF EXISTS 
		(SELECT id FROM public.categories WHERE id = $1) 
	THEN 
		UPDATE public.categories SET classifier = $2, name = $3, parent = $4 WHERE id = $1 
	ELSE 
		INSERT INTO public.categories (id, classifier, name, parent) VALUES ($1, $2, $3, $4) 
	END IF`, [id, req.body.classifier, req.body.name, req.body.parent])
	.then(() => {
		res.json({id})
	})
	.catch((err) => {
		console.log(err)
		res.status(500).end()
	})
})


app.post('/save_product', (req, res) => {
	let productId = req.body.id
	if (!productId) {productId = newGUID()} 

	pool.query(
		`IF EXISTS 
			(SELECT id FROM public.products WHERE id = $1) 
		THEN 
			UPDATE public.products SET name = $2 WHERE id = $1 
		ELSE 
			INSERT INTO public.products (id, name) VALUES ($1, $2) 
		END IF`, [productId, req.body.name]
	)
	.then(() => {
		let promises = req.body.categories.map((categoryObj) => {
			if (categoryObj.category) {
				return pool.query(
					`IF EXISTS 
						(SELECT product FROM public.products_to_categories WHERE product = $1 AND classifier = $2) 
					THEN 
						UPDATE public.products_to_categories SET category = $3 WHERE product = $1 AND classifier = $2
					ELSE 
						INSERT INTO public.products_to_categories (product, classifier, category) VALUES ($1, $2, $3) 
					END IF`, [productId, categoryObj.classifier, categoryObj.category]
				) 
			} else {
				return pool.query(`DELETE FROM public.products_to_categories WHERE product = $1 AND classifier = $2`, [productId, categoryObj.classifier])  //delete
			}
		})
		return Promise.all(promises)	
	})
	.then(() => {
		res.json({id: productId})
	})
	.catch((err) => {
		console.log(err)
		res.status(500).end()
	})
})


app.post('/get_goods', (req, res) => {
	let classifier = req.body.classifier
	let parent = req.body.parent

	let categories = []
	let products = []

	console.log('classifier: ' + classifier)
	console.log('parent: ' + parent)
	if (!parent) {
		parent = ''
	}

	pool.query(`SELECT id, name FROM public.categories WHERE classifier = $1 AND parent = $2 `, [classifier, parent])
	.then((queryResult) => {
		queryResult.rows.map( (row) => {
			categories.push({name: row.name, id: row.id})
		})
	})		
	.then(() => {
		console.log('q1')
		return pool.query(
			`SELECT 
				products.name, 
				products.id 
			FROM public.products AS products 
			INNER JOIN public.products_to_categories AS products_to_categories 
				ON products.id = products_to_categories.product
			WHERE products_to_categories.category = $1 
				AND products_to_categories.classifier = $2`, [parent, classifier])
	})
	.then((queryResult) => {
		queryResult.rows.map( (row) => {
			products.push({name: row.name, id: row.id})
		})
		res.json({categories, products})
	})
	.catch( (err) => {
		console.log(err)
		res.status(500).end()
	} )
})

//	+	save_classifier(id, name)
//	+	save_product(id, name, categories: [{classifier, category}])
//  +	save_category(id, classifier, name, parent)
//	+	get_classifiers() => [{id, name}]
//	+	get_goods(classifier, parent) => {categories: [{id, name}], products: [{id, name}]}


app.listen(3010, ()=> {console.log('web-server started')})