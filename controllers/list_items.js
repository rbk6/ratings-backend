// imports
const db = require('../db')
const { StatusCodes } = require('http-status-codes')
const { NotFoundError, APIError, BadRequestError } = require('../errors')

/* todo: refactor list-items and ratings controllers to reduce redundancy */

// get list items of a particular user by list name
const getListItems = async (req, res) => {
  const { id: userId, list_name } = req.params
  const query = {
    text: 'SELECT * FROM list_item WHERE user_id = $1 AND list_name = $2',
    values: [userId, list_name],
  }
  const list_items = await db.query(query)
  if (!list_items || list_items.rowCount === 0)
    throw new NotFoundError(
      `No list from user_id ${userId} found with list_name ${list_name}`
    )
  return res.status(200).json({ data: list_items.rows })
}

// add list item
const addListItem = async (req, res) => {
  const { user_id, movie_id, show_id, list_name, image_url } = req.body
  if (!list_name || !user_id || (!movie_id && !show_id))
    throw new BadRequestError(
      !list_name
        ? 'List name field cannot be empty'
        : !user_id
        ? 'Unable to submit, user_id not defined'
        : 'Must provide movie_id or show_id'
    )
  const query = {
    text:
      'INSERT INTO list_item(user_id, movie_id, show_id, list_name, image_url) ' +
      'VALUES($1, $2, $3, $4, $5)',
    values: [user_id, movie_id, show_id, list_name, image_url],
  }
  try {
    await db.query(query)
    return res.status(StatusCodes.CREATED).json({ status: 'success' })
  } catch (err) {
    if (err.detail.includes('already exists'))
      throw new BadRequestError(`List item already added to ${list_name}`)
    else throw new APIError()
  }
}

// remove list item
const removeListItem = async (req, res) => {
  const { user_id, list_name, movie_id, show_id } = req.body
  const query = movie_id
    ? {
        text: 'DELETE FROM list_item WHERE user_id = $1 AND list_name = $2 AND movie_id = $3',
        values: [user_id, list_name, movie_id],
      }
    : {
        text: 'DELETE FROM list_item WHERE user_id = $1 AND list_name = $2 AND show_id = $3',
        values: [user_id, list_name, show_id],
      }
  const list_item = await db.query(query)
  if (list_item.rowCount === 0)
    throw new NotFoundError(
      `No list item from user_id ${user_id} found with provided fields`
    )
  return res.status(200).json({ status: 'success' })
}

// get lists
const getLists = async (req, res) => {
  const { id: userId } = req.params
  const query = {
    text: 'SELECT DISTINCT list_name FROM list_item WHERE user_id = $1',
    values: [userId],
  }
  const lists = await db.query(query)
  if (!lists || lists.rowCount === 0)
    throw new NotFoundError(`No lists from user_id ${userId} found`)
  return res.status(200).json({ data: lists.rows })
}

// delete list
const deleteList = async (req, res) => {
  const { id: userId, list_name } = req.params
  const query = {
    text: 'DELETE FROM list_item WHERE user_id = $1 AND list_name = $2',
    values: [userId, list_name],
  }
  const list = await db.query(query)
  if (list.rowCount === 0)
    throw new NotFoundError(
      `No list from user_id ${userId} found with list_name ${list_name}`
    )
  return res.status(200).json({ status: 'success' })
}

module.exports = {
  getListItems,
  addListItem,
  removeListItem,
  getLists,
  deleteList,
}
