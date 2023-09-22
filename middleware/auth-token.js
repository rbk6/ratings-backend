const db = require('../db')
const jwt = require('jsonwebtoken')
const moment = require('moment')

const checkAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token)
    return res.status(401).json({ msg: 'User not authorized, please login.' })
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err)
      return res.status(403).json({
        msg: 'Session expired, you have been logged out.',
      })

    const currentTime = moment().unix()
    const refreshThreshold = moment.duration(5, 'minutes').asSeconds()

    if (user.exp - currentTime < refreshThreshold) {
      const refreshTokenIsValid = await checkRefreshToken(user.username)
      if (refreshTokenIsValid) {
        const newAccessToken = generateAccessToken(user.username)
        return res.status(200).json({ accessToken: newAccessToken })
      } else {
        return res
          .status(401)
          .json({ msg: 'Session expired, you have been logged out.' })
      }
    }

    res.user = user
    next()
  })
}

async function checkRefreshToken(username) {
  const query = {
    text: 'SELECT refresh_token, refresh_expiration FROM "user" WHERE username = $1',
    values: [username],
  }
  const refreshToken = await db.query(query)
  if (!refreshToken || refreshToken.rowCount === 0) return false
  if (moment(refreshToken.rows[0].refresh_expiration).isBefore(moment())) {
    return false
  }
  const token = refreshToken.rows[0].refresh_token
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err) => {
    if (err) return false
  })
  return true
}

const generateAccessToken = (username) =>
  jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '30m',
  })

const generateRefreshToken = async (username) => {
  const refreshToken = jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET)
  const refreshExpiration = moment()
    .add(30, 'days')
    .format('MM/DD/YYYY hh:mm A')
  const query = {
    text: 'UPDATE "user" SET refresh_token = $1, refresh_expiration = $2 WHERE username = $3',
    values: [refreshToken, refreshExpiration, username],
  }
  try {
    await db.query(query)
    return refreshToken
  } catch (err) {
    return null
  }
}

module.exports = {
  checkAuth,
  checkRefreshToken,
  generateAccessToken,
  generateRefreshToken,
}
