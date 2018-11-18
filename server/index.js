const express = require('express');
const app = express();
const path = require('path');

const routes = require('./lib/routes');

app.use(express.static('public'));
app.set('views', path.resolve('./views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));
routes(app);

module.exports = app;
