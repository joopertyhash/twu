const request = require('request-promise-native')
const express = require('express')
const files = require('express-fileupload')
const cookies = require('cookie-parser')

const autoposter = require('./autoposter')
const io = require('./io')
const DEFS = require('./definitions')



let currentUser = {
  sessionKey: '',
  token: '',
  secret: '',
  name: ''
}

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


app.get('/', (req, res) => {
  res.sendFile('index.html', DEFS.HTML_OPTIONS)
})

app.get('/api/sess', (req, res) => {
  // console.log(req.cookies)
  if (req.cookies.session){
    res.status(200).end()
  }
  else{
    res.status(400).end()
  }
})


app.get('/upload', (req, res) => {
  if (req.cookies.session){
    res.sendFile('upload.html', DEFS.HTML_OPTIONS)
  }else{
    res.sendFile('error.html', DEFS.HTML_OPTIONS)
  }
})

app.post('/api/upload', (req, res) => {
  let file = req.files.file
  let session = req.cookies.session

  console.log('Received ' + file.name + ' from ' + session)

  autoposter.enqueue(file, currentUser)
  .then(response => {
    res.send(response.text)
  })
  .catch(response => {
    res.status(response.status).send(response.text)
  })
  .catch(err => {
    console.log(err)
  })
})


app.get('/api/auth', (req, res) => {
  console.log("Somebody is logging in...")

  let sessionKey = randomString(DEFS.SESSION_KEY_SIZE)
  currentUser.sessionKey = sessionKey
  res.cookie('session', sessionKey)

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
  // console.log(req.query)
  autoposter.callback(req.query.oauth_token, req.query.oauth_verifier, currentUser)
  .then(result => {
    currentUser = result
    res.redirect(baseURL) // index.html
    autoposter.tweet('kaizo', currentUser)
  })
  .catch(err => {
    console.log(err)
    res.send(err)
  })
})




console.log('Listening on ' + DEFS.PORT)
app.listen(DEFS.PORT, DEFS.ADDRESS);
