const express = require('express')
const router = express.Router()
const handleCache = require('../middleware/handle-cache')

const {
  getListItems,
  addListItem,
  getLists,
  deleteList,
  removeListItem,
} = require('../controllers/list_items')

router.route('/').post(addListItem).delete(removeListItem)
router.route('/:id').get(getLists, handleCache(300))
router
  .route('/:id/:list_name')
  .get(getListItems, handleCache(300))
  .delete(deleteList)

module.exports = router
