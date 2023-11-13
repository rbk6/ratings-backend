// imports
const db = require('../db')
const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError, APIError } = require('../errors')

// get ratings of all users
const getAllRatings = async (req, res) => {
  const query = { text: 'SELECT * FROM rating' }
  const ratings = await db.query(query)
  return res
    .status(StatusCodes.OK)
    .json({ ratingCount: ratings.rowCount, data: ratings.rows })
}

// get ratings of a particular user
const getUserRatings = async (req, res) => {
  const { id: userId } = req.params
  const query = {
    text: 'SELECT * FROM rating WHERE user_id = $1',
    values: [userId],
  }
  const ratings = await db.query(query)
  if (ratings.rowCount === 0)
    throw new NotFoundError(`No ratings found for user_id ${userId}`)
  return res
    .status(StatusCodes.OK)
    .json({ ratingCount: ratings.rowCount, data: ratings.rows })
}

// get rating of a particular user
const getUserRating = async (req, res) => {
  const { id: userId, contentId } = req.params
  const query = {
    text: 'SELECT * FROM rating WHERE user_id = $1 AND content_id = $2',
    values: [userId, contentId],
  }
  const rating = await db.query(query)
  if (!rating || rating.rowCount === 0)
    throw new NotFoundError(
      `No rating from user_id ${userId} found with content_id ${contentId}`
    )
  return res.status(200).json({ data: rating.rows[0] })
}

// create rating
const createRating = async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    )
    const user_id = decodedToken.id
    const { title, user_rating, content, image, content_id } = req.body
    if (!title || !user_rating || !user_id || !content_id)
      throw new BadRequestError(
        !title || !user_rating
          ? 'Title or User Rating fields cannot be empty'
          : !user_id
          ? 'Unable to submit, user_id not defined'
          : 'Must provide content_id'
      )
    const query = {
      text:
        'INSERT INTO rating(title, user_rating, content, user_id, content_id,' +
        ' image) VALUES($1, $2, $3, $4, $5, $6)',
      values: [title, user_rating, content, user_id, content_id, image],
    }
    try {
      await db.query(query)
      return res.status(StatusCodes.CREATED).json({ status: 'success' })
    } catch (err) {
      if (err.message.includes('unique')) {
        const id = err.detail.split('(')[2].split(')')[0].split(',')[0]
        return res.status(StatusCodes.CONFLICT).json({
          msg: `You already have a rating for ${title}, edit it in your profile.`,
          id: id,
        })
      } else if (err.message.includes('varying(500)')) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          msg: 'Your description cannot exceed 500 characters.',
        })
      }
      throw new APIError()
    }
  } catch (err) {
    throw new APIError()
  }
}

// update rating
const updateRating = async (req, res) => {
  const { id: userId, contentId } = req.params
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
      'WHERE content_id = $3 AND user_id = $4 RETURNING *',
    values: [user_rating, content, contentId, userId],
  }
  try {
    const rating = await db.query(query)
    if (rating.rowCount === 0)
      throw new NotFoundError(
        `No rating from user_id ${userId} found with content_id ${contentId}`
      )
    return res
      .status(StatusCodes.OK)
      .json({ status: 'success', updated_at: rating.rows[0].updated_at })
  } catch (err) {
    throw new NotFoundError(
      `No rating from user_id ${userId} found with content_id ${contentId}`
    )
  }
}

// delete rating
const deleteRating = async (req, res) => {
  const { id: userId, contentId } = req.params
  const query = {
    text: 'DELETE FROM rating WHERE user_id = $1 AND content_id = $2',
    values: [userId, contentId],
  }
  const rating = await db.query(query)
  if (rating.rowCount === 0)
    throw new NotFoundError(
      `No rating from user_id ${userId} found with content_id ${contentId}`
    )
  return res.status(200).json({ status: 'success' })
}

module.exports = {
  getAllRatings,
  getUserRatings,
  getUserRating,
  createRating,
  updateRating,
  deleteRating,
}
