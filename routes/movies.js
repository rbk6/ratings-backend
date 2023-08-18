const express = require('express')
const router = express.Router()

const { getMovies, getMovie } = require('../controllers/movies')
const handleCache = require('../middleware/handle-cache')

router.route('/:page', handleCache(300)).get(getMovies)
router.route('/movie/:id', handleCache(300)).get(getMovie)

module.exports = router
