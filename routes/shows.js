const express = require('express')
const router = express.Router()

const { getShows, getShow } = require('../controllers/shows')

router.route('/:page').get(getShows)
router.route('/show/:id').get(getShow)

module.exports = router
