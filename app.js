const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require("morgan");
const appRoutes = require('./routes/app.js');

app = express();

app.set("view engine", "pug");

mongoose.connect('mongodb+srv://eliel512:Dexter512@cluster0.yu7rg.mongodb.net/qrgenerator',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
	next();
});

app.use(morgan("tiny"));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/', appRoutes);

module.exports = app;
