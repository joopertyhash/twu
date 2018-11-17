const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  sessionKey: String,
  tweeterID: String,
  name: String,
  token: String,
  secret: String
})

//  denote everything (functions too) about a model before compiling!
const UserModel = mongoose.model('User', userSchema);

let db = null;

function connect(port){
  mongoose.connect('mongodb://localhost:' + port + '/db', {
    useNewUrlParser: true
  });
  db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', () => console.log('Connected to database!'))
}

function getUser(sessionKey){
  return UserModel.findOne({sessionKey: sessionKey}).exec()
}

function getUserLean(sessionKey){
  return UserModel.findOne({sessionKey: sessionKey}).lean()
}

// If user already logged, only change sessionID, else, register
function createUser(user){
  return new Promise((resolve, reject) => {
    UserModel.findOne({tweeterID: user.tweeterID})
    .then(foundUser => {
      if (foundUser) {
        foundUser.sessionKey = user.sessionKey
        foundUser.save()
        .then(u => {
          resolve(u)
        })
        .catch(err => {
          reject(err)
        })
      }
      else {
        let u = new UserModel({
          sessionKey: user.sessionKey,
          tweeterID: user.tweeterID,
          name: user.name,
          token: user.token,
          secret: user.secret
        })
        u.save()
        .then(u => {
          resolve(u)
        })
        .catch(err => {
          reject(err)
        })
      }
    })
    .catch(err => {
      console.log("ERROR!!!" + err)
      reject("Error at creating user!")
    })
  })
}

function printUsers() {
  UserModel.find({}, (err, users) => {
    console.log('Curent users:\n' + users)
  })
}

module.exports = {
  connect: (port) => {
    connect(port)
  },
  getUser: (sessionKey) => {
    return getUser(sessionKey)
  },
  getUserLean: (sessionKey) => {
    return getUserLean(sessionKey)
  },
  createUser: (user) => {
    return createUser(user)
  },
  printUsers: () => {
    printUsers()
  }
}
