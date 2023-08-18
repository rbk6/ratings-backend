const APIError = require('./api-error')
const { StatusCodes } = require('http-status-codes')

class TooManyRequestsError extends APIError {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.TOO_MANY_REQUESTS
  }
}

module.exports = TooManyRequestsError
