// imports
require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()
const errorHandler = require('./middleware/error-handler')
const { checkAuth } = require('./middleware/auth-token')

// routers
const authRouter = require('./routes/auth')
const listRouter = require('./routes/list_items')
const ratingRouter = require('./routes/ratings')
const showRouter = require('./routes/shows')
const movieRouter = require('./routes/movies')

// middleware
app.use(express.json())

// user authentication
app.use('/api/v1/auth', authRouter)
app.use(checkAuth)

// routes
app.use('/api/v1/ratings', ratingRouter)
app.use('/api/v1/shows', showRouter)
app.use('/api/v1/movies', movieRouter)
app.use('/api/v1/listItems', listRouter)

app.use(errorHandler)

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`server is listening on port ${port}...`))
