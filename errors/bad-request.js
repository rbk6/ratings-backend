const APIError = require('./api-error')
const { StatusCodes } = require('http-status-codes')

class BadRequestError extends APIError {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.BAD_REQUEST
  }
}

module.exports = BadRequestError
