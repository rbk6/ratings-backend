const rateLimit = require('express-rate-limit')

const setRateLimit = (windowMs, max) => {
  return rateLimit({
    windowMs,
    max,
  })
}

module.exports = {
  setRateLimit,
}
