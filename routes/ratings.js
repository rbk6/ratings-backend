const express = require('express')
const router = express.Router()

const {
  getAllRatings,
  getUserRatings,
  getUserRating,
  createRating,
  updateRating,
  deleteRating,
} = require('../controllers/ratings')

router.route('/').post(createRating).get(getAllRatings)
router.route('/:id').get(getUserRatings)
router
  .route('/:id/:ratingId')
  .get(getUserRating)
  .patch(updateRating)
  .delete(deleteRating)

module.exports = router
