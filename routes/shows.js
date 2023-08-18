const express = require('express')
const router = express.Router()
const handleCache = require('../middleware/handle-cache')

const { getShows, getShow } = require('../controllers/shows')

router.route('/:page', handleCache(300)).get(getShows)
router.route('/show/:id', handleCache(300)).get(getShow)

module.exports = router
