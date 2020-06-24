const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://socialape-e2298.firebaseio.com',
  storageBucket: 'socialape-e2298.appspot.com',
});

const fs = admin.firestore();

module.exports = { admin, fs };
