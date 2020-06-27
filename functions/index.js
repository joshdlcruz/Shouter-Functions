const functions = require('firebase-functions');
const app = require('express')();
const fireAuth = require('./util/fireAuth');
const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
} = require('./handlers/screams');
const {
  signUp,
  logIn,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} = require('./handlers/users');

// scream routes
app.get('/screams', getAllScreams);
app.post('/scream', fireAuth, postOneScream);
app.get('/scream/:screamId', getScream);
app.post('/scream/:screamId/comment', fireAuth, commentOnScream);

// user routes
app.post('/signup', signUp);
app.post('/login', logIn);
app.post('/user/image', fireAuth, uploadImage);
app.post('/user', fireAuth, addUserDetails);
app.get('/user', fireAuth, getAuthenticatedUser);

exports.api = functions.region('asia-northeast1').https.onRequest(app);
