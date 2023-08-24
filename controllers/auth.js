// imports
const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
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
      throw new BadRequestError('Invalid username/password, please try again.')
    if (await bcrypt.compare(password, user.rows[0].password)) {
      const accessToken = jwt.sign(username, process.env.ACCESS_TOKEN_SECRET)
      res.json({ accessToken: accessToken })
    } else {
      res.json({ msg: 'Invalid username/password, please try again.' })
    }
  } catch {
    res
      .status(500)
      .json({ msg: 'There was an error logging in, please try again.' })
  }
}

module.exports = {
  register,
  login,
}
