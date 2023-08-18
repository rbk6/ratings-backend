// controller for [external] TheMovieDB (TMDB) API @https://developer.themoviedb.org/docs
// imports
const axios = require('axios')
const { StatusCodes } = require('http-status-codes')

const getMovies = async (req, res) => {
  const { page } = req.params
  const options = {
    method: 'GET',
    url: process.env.TMDB_PAGE_URI + `?page=${page}`,
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer ' + process.env.TMDB_SECRET,
    },
  }
  try {
    const response = await axios.request(options)
    const { data: movies } = response

    return res
      .status(StatusCodes.OK)
      .json({ movieCount: movies.results.length, data: movies })
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'An error occurred while getting movies, please try again.',
    })
  }
}

const getMovie = async (req, res) => {
  const { id } = req.params
  const options = {
    method: 'GET',
    url: process.env.TMDB_ID_URI + `/${id}?`,
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer ' + process.env.TMDB_SECRET,
    },
  }
  try {
    const response = await axios.request(options)
    const { data: movie } = response

    return res.status(StatusCodes.OK).json({ data: movie })
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: `An error occurred while attempting to access movie with id ${id}, please try again.`,
    })
  }
}

module.exports = {
  getMovies,
  getMovie,
}
