// controller for [external] TVmaze API @https://api.tvmaze.com/
// imports
const axios = require('axios')
const { StatusCodes } = require('http-status-codes')
const { TooManyRequestsError } = require('../errors')

// get pagination of shows
const getShows = async (req, res) => {
  const { page } = req.params
  const itemsPerPage = Math.ceil(250 / 3)
  const apiPage = Math.floor(page / 3)
  const startIndex = (page % 3) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  try {
    const response = await axios.get(
      process.env.TVMAZE_URI + `/shows?page=${apiPage}`
    )

    const shows = response.data.slice(startIndex, endIndex)

    const formattedResults = shows.map(
      ({ id, name, premiered, ended, status, image, summary }) => ({
        id: id,
        title: name,
        releaseDate: premiered,
        endDate: ended,
        status: status,
        image: image.original,
        description: summary,
      })
    )

    return res
      .status(StatusCodes.OK)
      .json({ showCount: formattedResults.length, data: formattedResults })
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
