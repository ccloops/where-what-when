'use strict';

const express = require('express');
const cors = require('cors');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());

app.get('/', (request, response) => {
  response.send('Hello World');
})

app.get('/location', (request, response) => {
  const locationInfo = geoSearch(request.query.data);
  response.send(locationInfo); 
});

function geoSearch(query) {
  const geoInfo = require('./data/geo.json');
  const location = new Location(geoInfo.results[0]);
  location.search_query = query;
  return location;
}

function Location(data) {
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

app.listen(PORT, () => console.log(`App is listening on PORT: ${PORT}`));
