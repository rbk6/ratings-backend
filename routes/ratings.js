const express = require('express')
const router = express.Router()
const handleCache = require('../middleware/handle-cache')

const {
  getAllRatings,
  getUserRatings,
  getUserRating,
  createRating,
  updateRating,
  deleteRating,
} = require('../controllers/ratings')

router.route('/').post(createRating).get(getAllRatings, handleCache(300))
router.route('/:id').get(getUserRatings, handleCache(300))
router
  .route('/:id/:ratingId')
  .get(getUserRating, handleCache(300))
  .patch(updateRating)
  .delete(deleteRating)

module.exports = router
