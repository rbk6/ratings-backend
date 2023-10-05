// controller for [external] TheMovieDB (TMDB) API @https://developer.themoviedb.org/docs
// imports
const axios = require('axios')
const { StatusCodes } = require('http-status-codes')

const getMovies = async (req, res) => {
  const { page } = req.params
  const pages = [
    page,
    parseInt(page) + 1,
    parseInt(page) + 2,
    parseInt(page) + 3,
  ]
  const requests = pages.map((page) => {
    const options = {
      method: 'GET',
      url: process.env.TMDB_PAGE_URI + `?page=${page}`,
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + process.env.TMDB_SECRET,
      },
    }
    return axios.request(options)
  })
  try {
    const responses = await Promise.all(requests)
    const results = responses.reduce(
      (acc, response) => [...acc, ...response.data.results],
      []
    )

    const formattedResults = results.map(
      ({ id, original_title, overview, release_date, poster_path }) => ({
        id: id,
        title: original_title,
        description: overview,
        releaseDate: release_date,
        image: `https://image.tmdb.org/t/p/w500/${poster_path}`,
      })
    )

    return res
      .status(StatusCodes.OK)
      .json({ movieCount: results.length, data: formattedResults })
  } catch (err) {
    console.log(err)
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
