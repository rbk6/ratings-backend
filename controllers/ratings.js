// import db
const db = require('../db')

/* TODO: implement error handling middleware */

// get ratings of all users
const getAllRatings = async (req, res) => {
  const query = {
    text: 'SELECT * FROM rating',
  }
  const ratings = await db.query(query)
  res.status(200).json(ratings.rows)
}

// get ratings of a particular user
const getUserRatings = async (req, res) => {
  const { id: userId } = req.params
  const query = {
    text: 'SELECT * FROM rating WHERE user_id = $1',
    values: [userId],
  }
  const ratings = await db.query(query)
  if (ratings.rowCount === 0) {
    res.status(404).json({ msg: `No ratings found for user_id ${userId}` })
  }
  res.status(200).json(ratings.rows)
}

// get rating of a particular user
const getUserRating = async (req, res) => {
  const { id: userId, ratingId } = req.params
  const query = {
    text: 'SELECT * FROM rating WHERE user_id = $1 AND rating_id = $2',
    values: [userId, ratingId],
  }
  const rating = await db.query(query)
  if (!rating) {
    throw new Error(
      `No rating from user_id ${userId} found with rating_id ${ratingId}`
    )
  } else {
    return res.status(200).json(rating.rows[0])
  }
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
  const { id: userId, ratingId } = req.params
  const { user_rating, content } = req.body
  if (!user_rating || !userId) {
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
    values: [user_rating, content, ratingId, userId],
  }
  try {
    const rating = await db.query(query)
    if (rating.rowCount === 0) {
      return res.status(404).json({
        status: 'failed',
        msg: `No rating from user_id ${userId} found with rating_id ${ratingId}`,
      })
    }
    res.status(201).json({ status: 'success' })
  } catch (err) {
    res.status(400).json({ status: 'failed', msg: err })
  }
}

// delete rating
const deleteRating = async (req, res) => {
  const { id: userId, ratingId } = req.params
  const query = {
    text: 'DELETE FROM rating WHERE user_id = $1 AND rating_id = $2',
    values: [userId, ratingId],
  }
  const rating = await db.query(query)
  if (rating.rowCount === 0) {
    return res.status(404).json({
      status: 'failed',
      msg: `No rating from user_id ${userId} found with rating_id ${ratingId}`,
    })
  }
  res.status(200).json({ status: 'success' })
}

module.exports = {
  getAllRatings,
  getUserRatings,
  getUserRating,
  createRating,
  updateRating,
  deleteRating,
}
