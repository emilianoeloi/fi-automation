var http = require('http'),
    fs = require('fs'),
    express = require('express'),
    bodyParser = require('body-parser'),
    mongo = require('mongodb'),
    monk = require('monk'),
    db = monk('localhost:27017/firefoxos');

var portfolioCollection = db.get('portfolio');
var stockCollection = db.get('stock');

var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var	server = http.createServer(app);
var _ = require('underscore');

module.exports = {
  express: express,
  app: app,
  server: server,
  _: _,
  portfolioCollection: portfolioCollection,
  stockCollection: stockCollection
}
