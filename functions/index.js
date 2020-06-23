const functions = require('firebase-functions');
const app = require('express')();
const fireAuth = require('./util/fireAuth');
const { getAllScreams, postOneScream } = require('./handlers/screams');
const { signUp, logIn } = require('./handlers/users');

// scream routes
app.get('/screams', getAllScreams);
app.post('/scream', fireAuth, postOneScream);

// user routes
app.post('/signup', signUp);
app.post('/login', logIn);

exports.api = functions.region('asia-northeast1').https.onRequest(app);