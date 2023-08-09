// imports
const db = require('../db')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError } = require('../errors')

/* todo: JWT integration, refresh/auth tokens, hash password, login */

const register = async (req, res) => {
  const { username, email, password, name } = req.body
  if (!username || !email || !password || !name)
    throw new BadRequestError('Must provide all fields to register')
  const query = {
    text: 'INSERT INTO "user"(username, email, password, name) VALUES($1, $2, $3, $4)',
    values: [username, email, password, name],
  }
  try {
    await db.query(query)
    return res.status(StatusCodes.CREATED).json({ status: 'success' })
  } catch (err) {
    throw new BadRequestError(err.detail)
  }
}

const login = async (req, res) => {}

module.exports = {
  register,
  login,
}
