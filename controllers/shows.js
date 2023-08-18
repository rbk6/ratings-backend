// controller for [external] TVmaze API @https://api.tvmaze.com/
// imports
const axios = require('axios')
const { StatusCodes } = require('http-status-codes')
const { TooManyRequestsError } = require('../errors')

// get pagination of shows
const getShows = async (req, res) => {
  const { page } = req.params
  try {
    const response = await axios.get(
      process.env.TVMAZE_URI + `/shows?page=${page}`
    )
    const { data: shows } = response

    return res
      .status(StatusCodes.OK)
      .json({ showCount: shows.length, data: shows })
  } catch (err) {
    if (err.response && err.response.status === StatusCodes.TOO_MANY_REQUESTS) {
      throw new TooManyRequestsError(
        `You have exceeded the rate limit, please wait a moment then try again.`
      )
    } else {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        msg: 'An error occurred while getting shows, please try again.',
      })
    }
  }
}

// get individual show by id
const getShow = async (req, res) => {
  const { id } = req.params
  try {
    const response = await axios.get(process.env.TVMAZE_URI + `/shows/${id}`)
    const { data: show } = response

    return res.status(StatusCodes.OK).json({ data: show })
  } catch (err) {
    if (err.response && err.response.status === StatusCodes.TOO_MANY_REQUESTS) {
      throw new TooManyRequestsError(
        `You have exceeded the rate limit, please wait a moment then try again.`
      )
    } else {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        msg: `An error occurred while attempting to access show with id ${id}, please try again.`,
      })
    }
  }
}

module.exports = {
  getShows,
  getShow,
}
