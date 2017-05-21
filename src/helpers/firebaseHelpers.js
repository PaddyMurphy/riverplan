import firebase from 'firebase'

export function fireInit (func) {
  var config = {
    apiKey: 'AIzaSyBdK00buP0niXTcedAZKWCRFwS9LnYKFZA',
    authDomain: 'riverplan-b40f7.firebaseapp.com',
    databaseURL: 'https://riverplan-b40f7.firebaseio.com',
    projectId: 'riverplan-b40f7',
    storageBucket: 'riverplan-b40f7.appspot.com',
    messagingSenderId: '103611077045'
  }
  firebase.initializeApp(config)

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      func(true, user)
    } else {
      func(false)
    }
  }, function (error) {
    console.log(error)
  })
}
