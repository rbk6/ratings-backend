// imports
require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()
const errorHandler = require('./middleware/error-handler')

// routers
const ratingRouter = require('./routes/ratings')

// middleware
app.use(express.json())

// routes
app.use('/api/v1/ratings', ratingRouter)

app.use(errorHandler)

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`server is listening on port ${port}...`))
