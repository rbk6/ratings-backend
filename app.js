// imports
require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()
const compression = require('compression')
const cors = require('cors')
const helmet = require('helmet')
const xss = require('xss-clean')
const errorHandler = require('./middleware/error-handler')
const { checkAuth } = require('./middleware/auth-token')
const { setRateLimit } = require('./middleware/rate-limit')

// routers
const authRouter = require('./routes/auth')
const listRouter = require('./routes/list_items')
const ratingRouter = require('./routes/ratings')
const showRouter = require('./routes/shows')
const movieRouter = require('./routes/movies')

// rate limits
const authLimiter = setRateLimit(15 * 60 * 1000, 10)
const contentLimiter = setRateLimit(30 * 60 * 1000, 100)

// middleware
app.use(express.json())
app.use(cors())
app.use(compression())
app.use(helmet())
app.use(xss())

// user authentication
app.use('/api/v1/auth', [authLimiter, authRouter])
app.use(checkAuth)

// routes
app.use('/api/v1/ratings', [contentLimiter, ratingRouter])
app.use('/api/v1/shows', [contentLimiter, showRouter])
app.use('/api/v1/movies', [contentLimiter, movieRouter])
app.use('/api/v1/listItems', [contentLimiter, listRouter])

app.use(errorHandler)

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`server is listening on port ${port}...`))
