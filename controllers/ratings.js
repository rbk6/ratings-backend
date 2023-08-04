// import db
const db = require('../db')

/**------------------- TODOs: --------------------*
/** refactor to account for user specific ratings |
/**    /:id -> getAllRatings -> use user_id       |
/**    /:id/:rating_id -> getRating -> use both   |
/**    /:id/:rating_id -> ...etc                  |
/**                                               |
/** fix db to increase rating_id for each user    | 
/**                                               |
/** implement error handling                      |
/**--------------------------------------------**/

// get all ratings
const getAllRatings = async (req, res) => {
  const query = {
    text: 'SELECT * FROM rating',
  }
  const ratings = await db.query(query)
  res.status(200).json(ratings.rows)
}

// get rating
const getRating = async (req, res) => {
  const { id } = req.params
  const query = {
    text: 'SELECT * FROM rating WHERE rating_id = $1',
    values: [id],
  }
  const rating = await db.query(query)
  if (!rating) {
    throw new Error(`No rating found with id ${id}`)
  }
  res.status(200).json(rating.rows[0])
}

// create rating
const createRating = async (req, res) => {
  const { title, user_rating, content, user_id, movie_id, show_id } = req.body
  if (!title || !user_rating || !user_id || (!movie_id && !show_id)) {
    throw new Error(
      !title || !user_rating
        ? 'Title or User Rating fields cannot be empty'
        : !user_id
        ? 'Unable to submit, user_id not defined'
        : 'Must provide movie_id or show_id'
    )
  }
  const query = {
    text:
      'INSERT INTO rating(title, user_rating, content, user_id, movie_id,' +
      ' show_id) VALUES($1, $2, $3, $4, $5, $6)',
    values: [title, user_rating, content, user_id, movie_id, show_id],
  }
  try {
    await db.query(query)
    res.status(201).json({ status: 'success' })
  } catch (err) {
    res.status(400).json({ status: 'failed', msg: err })
  }
}

// update rating
const updateRating = async (req, res) => {
  const { id } = req.params
  const { user_rating, content, user_id } = req.body
  if (!user_rating || !user_id) {
    throw new Error(
      !user_rating
        ? 'User Rating field cannot be empty'
        : 'Unable to submit, user_id not defined'
    )
  }
  const query = {
    text:
      'UPDATE rating SET user_rating = $1, content = $2 ' +
      'WHERE rating_id = $3 AND user_id = $4',
    values: [user_rating, content, id, user_id],
  }
  try {
    await db.query(query)
    res.status(201).json({ status: 'success' })
  } catch (err) {
    res.status(400).json({ status: 'failed', msg: err })
  }
}

// delete rating
const deleteRating = async (req, res) => {
  const { id } = req.params
  const query = {
    text: 'DELETE FROM rating WHERE rating_id = $1',
    values: [id],
  }
  const rating = await db.query(query)
  if (rating.rowCount === 0) {
    throw new Error(`No rating found with id ${id}`)
  }
  res.status(200).json({ status: 'success' })
}

module.exports = {
  getAllRatings,
  getRating,
  createRating,
  updateRating,
  deleteRating,
}
