const functions = require('firebase-functions');
const app = require('express')();
const fireAuth = require('./util/fireAuth');
const { fs } = require('./util/admin');
const {
  getAllScreams,
  postOneScream,
  getScream,
  deleteScream,
  likeScream,
  unlikeScream,
  commentOnScream,
} = require('./handlers/screams');
const {
  signUp,
  logIn,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsAsRead,
} = require('./handlers/users');

// scream routes
app.get('/screams', getAllScreams);
app.post('/scream', fireAuth, postOneScream);
app.get('/scream/:screamId', getScream);
app.delete('/scream/:screamId', fireAuth, deleteScream);
app.get('/scream/:screamId/like', fireAuth, likeScream);
app.get('/scream/:screamId/unlike', fireAuth, unlikeScream);
app.post('/scream/:screamId/comment', fireAuth, commentOnScream);

// user routes
app.post('/signup', signUp);
app.post('/login', logIn);
app.post('/user/image', fireAuth, uploadImage);
app.post('/user', fireAuth, addUserDetails);
app.get('/user', fireAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);
app.post('/notifications', fireAuth, markNotificationsAsRead);

exports.api = functions.region('asia-northeast1').https.onRequest(app);

exports.createNotificationOnLike = functions
  .region('asia-northeast1')
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    fs.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return fs.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            screamId: doc.id,
          });
        }
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.deleteNotificationOnUnLike = functions
  .region('asia-northeast1')
  .firestore.document('likes/{id}')
  .onDelete((snapshot) => {
    fs.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnComment = functions
  .region('asia-northeast1')
  .firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    fs.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return fs.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            screamId: doc.id,
          });
        }
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
