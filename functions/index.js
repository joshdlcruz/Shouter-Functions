const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const express = require('express');
const firebase = require('firebase');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://socialape-e2298.firebaseio.com',
});

const firebaseConfig = {
  apiKey: 'AIzaSyChjblnOPrqpFvTV6QVJE1r0BVPHnL2bDs',
  authDomain: 'socialape-e2298.firebaseapp.com',
  databaseURL: 'https://socialape-e2298.firebaseio.com',
  projectId: 'socialape-e2298',
  storageBucket: 'socialape-e2298.appspot.com',
  messagingSenderId: '343547952008',
  appId: '1:343547952008:web:03435e7b6c0ff55d4bd83d',
  measurementId: 'G-YC7ER77J9G',
};

const app = express();

firebase.initializeApp(firebaseConfig);
const fs = admin.firestore();

app.get('/screams', (req, res) => {
  fs.collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.error(err));
});

app.post('/screams', (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  fs.collection('screams')
    .add(newScream)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    });
});

// Signup route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  // Validate data
  let token, userId;
  fs.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken' });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };

      return fs.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'email is already taken' });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.region('asia-northeast1').https.onRequest(app);
