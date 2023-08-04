const express = require('express')
const router = express.Router()

const {
  getAllRatings,
  getRating,
  createRating,
  updateRating,
  deleteRating,
} = require('../controllers/ratings')

router.route('/').post(createRating).get(getAllRatings)
router.route('/:id').get(getRating).patch(updateRating).delete(deleteRating)

module.exports = router
