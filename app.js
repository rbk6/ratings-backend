// imports
require('dotenv').config()
const express = require('express')
require('express-async-errors')
const app = express()

// routers
const ratingRouter = require('./routes/ratings')

// middleware
app.use(express.json())

// routes
app.use('/api/v1/ratings', ratingRouter)

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`server is listening on port ${port}...`))
