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

exports.api = functions.region('asia-east2').https.onRequest(app);

exports.createNotificationOnLike = functions
  .region('asia-east2')
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    return fs
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
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
      .catch((err) => console.error(err));
  });

exports.deleteNotificationOnUnLike = functions
  .region('asia-east2')
  .firestore.document('likes/{id}')
  .onDelete((snapshot) => {
    return fs
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnComment = functions
  .region('asia-east2')
  .firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    return fs
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
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
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.onUserImageChange = functions
  .region('asia-east2')
  .firestore.document('/users/{userId}')
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log('image has changed');
      const batch = fs.batch();
      return fs
        .collection('screams')
        .where('userHandle', '==', change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const scream = fs.doc(`/screams/${doc.id}`);
            batch.update(scream, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onScreamDelete = functions
  .region('asia-east2')
  .firestore.document('/screams/{screamId}')
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = fs.batch();
    return fs
      .collection('comments')
      .where('screamId', '==', screamId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(fs.doc(`/comments/${doc.id}`));
        });
        return fs.collection('likes').where('screamId', '==', screamId).get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(fs.doc(`/likes/${doc.id}`));
        });
        return fs
          .collection('notifications')
          .where('screamId', '==', screamId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(fs.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });
