'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());

app.get('/', (request, response) => {
  response.send('Hello World');
});

app.get('/location', (request, response) => {
  getCoordinates(request.query.data)
  .then(locationInfo => response.send(locationInfo))
  .catch(error => handleError(error, response));
});

app.get('/weather', getWeather);
app.get('/yelp', getYelp);
app.get('/movies', getMovies);

function handleError(error, response) {
  console.error('__ERROR__', error);
  if (response) response.status(500).send('oooooops');
}

function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.body.results[0].formatted_address;
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

function Yelp(restaurant) {
  this.name = restaurant.name;
  this.image_url = restaurant.image_url;
  this.price = restaurant.price;
  this.rating = restaurant.rating;
  this.url = restaurant.url;
}

function Movie(movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = 'https://image.tmdb.org/t/p/w200_and_h300_bestv2' + movie.poster_path;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
}

function getCoordinates(query) {
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(URL)
    .then(data => {
      if (!data.body.results.length) throw 'NO DATA AVAILABLE';
      else {
        return new Location(query, data);
      }
    })
    .catch(error => handleError(error));
}

function getWeather(request, response) {
  const URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  return superagent.get(URL)
  .then(result => {
   const weatherInformation = [];
   result.body.daily.data.map(day => {
     const summary = new Weather(day);
     weatherInformation.push(summary);
   })
   response.send(weatherInformation);
  })
  .catch(error => handleError(error, response));
}

function getYelp(request, response) {
  const URL = `https://api.yelp.com/v3/businesses/search?location=${request.query.data.search_query}`;
  superagent.get(URL)
  .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
  .then(result => {
   const yelpInformation = result.body.businesses.map(business => {
     return new Yelp(business);
   })
   response.send(yelpInformation);
  })
  .catch(error => handleError(error, response));
}

function getMovies(request, response) {
  const URL = `https://api.themoviedb.org/3/search/movie/?api_key=${process.env.MOVIE_API_KEY}&language=en-US&page=1&query=${request.query.data.search_query}`;
  superagent.get(URL)
  .then(data => {
    const movieInformation = data.body.results.map(movie => {
      return new Movie(movie);
    })
    response.send(movieInformation);
  })
  .catch(error => handleError(error, response));
}

app.listen(PORT, () => console.log(`App is listening on PORT: ${PORT}`));
