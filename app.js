require('dotenv').config()

const express = require('express')
const app = express()

const db = require('./db')

app.use(express.json())

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`server is listening on port ${port}...`))
