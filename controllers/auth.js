// imports
const db = require('../db')
const bcrypt = require('bcryptjs')
const tokens = require('../middleware/auth-token')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError } = require('../errors')

const register = async (req, res) => {
  const { username, email, password, name } = req.body
  if (!username || !email || !password || !name)
    throw new BadRequestError('Must provide all fields to register')
  try {
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)
    const query = {
      text: 'INSERT INTO "user"(username, email, password, name) VALUES($1, $2, $3, $4)',
      values: [username, email, hashedPassword, name],
    }
    await db.query(query)
    return res.status(StatusCodes.CREATED).json({ status: 'success' })
  } catch (err) {
    const msg = err.constraint.includes('username')
      ? 'Username is taken, please provide a different one.'
      : err.constraint.includes('email')
      ? 'Email is already in use, please provide a different one.'
      : 'Unable to create account, please try again.'
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: msg, status: 'failed' })
  }
}

const login = async (req, res) => {
  const { username, password } = req.body
  const query = {
    text: 'SELECT * FROM "user" WHERE username = $1 LIMIT 1',
    values: [username],
  }
  try {
    const user = await db.query(query)
    if (!user || user.rowCount === 0)
      return res
        .status(400)
        .json({ msg: 'Invalid username/password, please try again.' })
    if (await bcrypt.compare(password, user.rows[0].password)) {
      const accessToken = tokens.generateAccessToken(username, user.rows[0].id)
      let refreshToken
      const refreshTokenIsValid = await tokens.checkRefreshToken(username)
      if (!refreshTokenIsValid || !refreshToken) {
        refreshToken = await tokens.generateRefreshToken(username)
      } else refreshToken = user.rows[0].refresh_token
      if (refreshToken == null) res.status(401).json({ msg: 'Unauthorized' })
      res.json({ accessToken: accessToken })
    } else {
      res
        .status(400)
        .json({ msg: 'Invalid username/password, please try again.' })
    }
  } catch (err) {
    res.status(500).json({
      msg: 'There was an error logging in, please try again.',
    })
  }
}

const logout = async (req, res) => {
  const { username } = req.body
  const query = {
    text:
      'UPDATE "user" SET refresh_token = NULL, refresh_expiration = NULL ' +
      'WHERE username = $1',
    values: [username],
  }
  try {
    await db.query(query)
    return res
      .status(StatusCodes.OK)
      .json({ status: 'user has been logged out' })
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'An error occurred during logout.', err: err })
  }
}

module.exports = {
  register,
  login,
  logout,
}
