const request = require('request-promise-native')
const express = require('express')
const files = require('express-fileupload')
const cookies = require('cookie-parser')
const mongoose = require('mongoose')

const autoposter = require('./autoposter')
const io = require('./io')
const DEFS = require('./definitions')
const db = require('./db')


const baseURL = 'http://' + DEFS.ADDRESS + ':' + DEFS.PORT + '/'



const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
function randomString(length){
  let string = ''
  for (let i = 0; i < length; i++){
    let index = Math.floor(Math.random() * 62) // 62 = char_amount
    string += chars[index]
  }
  return string
}


let app = express()
app.use(files())
app.use(cookies())


function checkSession(sessionKey, lean){
  return new Promise((resolve, reject) => {
    if (!sessionKey){
      reject(DEFS.NO_SESSION)
    }
    else{
      if (lean){
        let user = db.getUserLean(sessionKey)
        .then(user => {
          if (user) {
            resolve(user)
          }
          else{
            reject(DEFS.SESSION_NOT_FOUND)
          }
        })
        .catch(err => {
          reject(err)
        })
      }
      else{
        let user = db.getUser(sessionKey)
        .then(user => {
          if (user) {
            resolve(user)
          }
          else{
            reject(DEFS.SESSION_NOT_FOUND)
          }
        })
        .catch(err => {
          reject(err)
        })
      }
    }
  })
  //get sessionID
}


app.get('/', (req, res) => {
  res.sendFile('index.html', DEFS.HTML_OPTIONS)
})

app.get('/api/sess', (req, res) => {
  // console.log(req.cookies)
  if (req.cookies.session){
    res.status(200).end()
  }
  else{
    res.status(420).send(DEFS.NO_SESSION)
  }
})

app.get('/profile', (req, res) => {
  if (req.cookies.session){
    res.sendFile('profile.html', DEFS.HTML_OPTIONS)
  }else{
    res.sendFile('error.html', DEFS.HTML_OPTIONS)
  }
})

app.get('/api/profile', (req, res) => {
  checkSession(req.cookies.session, true)
  .then(user => {
    let tweets = autoposter.getPendingTweets(user.tweeterID)
    let errors = autoposter.getErrors(user.tweeterID)
    res.send(JSON.stringify({
      name: user.name,
      errors: errors,
      tweets: tweets
    }))
  })
  .catch(err => {
    res.send(err)
    console.log(err)
  })
})


app.get('/upload', (req, res) => {
  // apply rate limiting...
  if (req.cookies.session){
    res.sendFile('upload.html', DEFS.HTML_OPTIONS)
  }else{
    res.sendFile('error.html', DEFS.HTML_OPTIONS)
  }
})

app.post('/api/upload', (req, res) => {
  checkSession(req.cookies.session, true)
  .then(user => {
    // apply rate limiting...
    let file = req.files.file
    console.log('Received ' + file.name + ' from ' + user.name)
    autoposter.enqueue(file, user)
    .then(response => {
      res.send(response.text)
    })
    .catch(err => {
      console.log("ERR: " + err)
      res.status(err.status).send(err.text)
    })
  })
  .catch(err => {
    res.send(err)
    console.log(err)
  })
})


app.get('/api/auth', (req, res) => {
  console.log("Somebody is logging in...")
  let sessionValidator = randomString(DEFS.SESSION_KEY_SIZE)
  res.cookie('validator', sessionValidator)

  autoposter.authorize()
  .then(token => {
    res.redirect('https://api.twitter.com/oauth/authorize?oauth_token=' + token)
  })
  .catch(err => {
    console.log(err)
    res.send(err)
  })
})

app.get('/api/callback', (req, res) => {
  console.log("Returning...")
  let sessionValidator = req.cookies.validator
  res.clearCookie('validator')

  if (!sessionValidator){ // If somebody tries to go directly to /api/callback...
    console.log('No validator key WTF?')
    res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ') // punish!
  }
  else{
    console.log('Validated')
    let sessionKey = randomString(DEFS.SESSION_KEY_SIZE)
    res.cookie('session', sessionKey)
    // console.log(req.query)
    autoposter.callback(req.query.oauth_token, req.query.oauth_verifier, sessionKey)
    .then(user => {
      res.redirect(baseURL) // index.html
      db.createUser(user)
      .then(user => {
        console.log('Successfully logged:\n' + user)
      })
      .catch(err => {
        console.log(err)
      })
    })
    .catch(err => {
      console.log(err)
      res.send(err)
    })
  }

})



db.connect(DEFS.PORT_DB)
// db.printUsers()
console.log('Listening on ' + DEFS.PORT)
app.listen(DEFS.PORT, DEFS.ADDRESS)

autoposter.startDequeueing()
