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
})

app.get('/location', (request, response) => {
  getCoordinates(request.query.data)
  .then(locationInfo => response.send(locationInfo))
  .catch(error => handleError(error, response));
});

function handleError(error, response) {
  console.error('__ERROR__', error);
  if (response) response.status(500).send('oooooops');
}

function getCoordinates(query) {
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(URL)
  .then(data => {
    if (!data.body.results.length) throw 'NO DATA AVAILABLE';
    else {
      let location = new Location(data.body.results[0]);
      location.search_query = query;
      return location;
    }
  })
}

function Location(data) {
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

app.get('/weather', getWeather);

function getWeather(request, response) {
  const URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  return superagent.get(URL)
  .then(result => {
   const weatherInformation = [];
   result.body.daily.data.forEach(day => {
     const summary = new Weather(day);
     weatherInformation.push(summary);
   })
   response.send(weatherInformation);
   console.log('weatherInformation: ', weatherInformation);
  })
  .catch(error => handleError(error, response));
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}
app.listen(PORT, () => console.log(`App is listening on PORT: ${PORT}`));
