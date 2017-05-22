<template>
  <div class="login">
      <h4>Users</h4>
      <ul is="transition-group">
        <li v-for="user in users" class="user" :key="user['.key']">
          <span>{{user.name}} - {{user.email}}</span>
          <button v-on:click="removeUser(user)">X</button>
        </li>
      </ul>

      <h4>Add new user</h4>
      <form id="form" v-on:submit.prevent="addUser">
        <input type="text" v-model="newUser.name" placeholder="Username">
        <input type="email" v-model="newUser.email" placeholder="email@email.com">
        <input type="submit" value="Add User">
      </form>

      <ul class="errors">
        <li v-show="!validation.name">Name cannot be empty.</li>
        <li v-show="!validation.email">Please provide a valid email address.</li>
      </ul>
  </div>
</template>

<script>
// TODO: webpack throws error in production
//       error: Unexpected token )
// import Firebase from 'firebase';

let usersRef;
// eslint-disable-next-line
const emailRE = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const firebaseConfig = {
  apiKey: 'AIzaSyBdK00buP0niXTcedAZKWCRFwS9LnYKFZA',
  authDomain: 'riverplan-b40f7.firebaseapp.com',
  databaseURL: 'https://riverplan-b40f7.firebaseio.com',
  projectId: 'riverplan-b40f7',
  storageBucket: 'riverplan-b40f7.appspot.com',
  messagingSenderId: '103611077045'
}
// setup Firebase
Firebase.initializeApp(firebaseConfig);
usersRef = Firebase.database().ref('users');

export default {
  name: 'navbar',
  data () {
    return {
      newUser: {
        name: '',
        email: ''
      }
    }
  },
  // firebase binding https://github.com/vuejs/vuefire
  firebase: {
    users: usersRef
  },
  // computed property for form validation state
  computed: {
    validation: function () {
      return {
        name: !!this.newUser.name.trim(),
        email: emailRE.test(this.newUser.email)
      }
    },
    isValid: function () {
      var validation = this.validation
      return Object.keys(validation).every(function (key) {
        return validation[key]
      })
    }
  },
  // methods
  methods: {
    addUser: function () {
      if (this.isValid) {
        usersRef.push(this.newUser)
        this.newUser.name = ''
        this.newUser.email = ''
      }
    },
    removeUser: function (user) {
      usersRef.child(user['.key']).remove()
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/scss/variables.scss';

.login {
  width: 50vw;
}

ul {
  padding: 0;
}

.user {
  height: auto;
  padding: 1em;
  border-top: 1px solid #eee;
  overflow: hidden;
  transition: all .25s ease;
}

.user:last-child {
  border-bottom: 1px solid #eee;
}

.v-enter, .v-leave-active {
  height: 0;
  padding-top: 0;
  padding-bottom: 0;
  border-top-width: 0;
  border-bottom-width: 0;
}

.errors {
  color: #f00;
}
</style>
