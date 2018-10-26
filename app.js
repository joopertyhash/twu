/*

  5 AUTORE BAIO GIXAU => LELENGOA ETA et al.




*/


/*

TODO:
  Beittu ia autorak Twitter deken. dictionary bat erabili ta lelengo biderrez sartzerakoan datuek eskatu usuarioa?
  Mensajien limitiek IOn aplikeu?
  Oauth autentifikazinoan erabili seguridade gixau, nonce...



*/

async function zi(){
  a = [1,2,3]
  for (let i = 0; i < 3; i++){
    await sleep(1000)
    console.log(a[i])
  }
}

const MESS_MAX_CHARS = 50
const MAX_AUTHORS = 5
const DATA_DIR = 'data/'
const REDIRECT_URI = 'http://localhost:50001/callback'

const request = require('request-promise-native')
const express = require('express')
const fileUpload = require('express-fileupload')
const io = require('./io')

const BACK_PORT = 50001

let consumer_keys = io.readConsumerKeys()
let oauth = {
  consumer_key: consumer_keys.consumer_key,
  consumer_secret: consumer_keys.consumer_secret,
  access_token: null,
  access_token_secret: null
}

async function prepareToTweet(filename){
  tweets = io.parse(DATA_DIR + filename)
  for (i in tweets){
    tweet(tweets[i])
    await sleep(15000)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function test(){
  request.post({
    url: 'https://api.twitter.com/1.1/statuses/update.json',
    form: {
      status: 'kaizo'
    },
    oauth: oauth
  })
  .then(result => console.log(result))
  .catch(err => console.log(err))
}

function tweet(tweet) {
  let message = tweetToString(tweet)
  console.log(message)
  request.post({
    url: 'https://api.twitter.com/1.1/statuses/update.json',
    form: {
      status: message
    },
    oauth: oauth
  })
  .then(result => console.log(result))
  .catch(err => console.log(err))
}

function tweetToString(tweet){
  console.log(tweet)
  let title = delimitTitle(tweet.title, MESS_MAX_CHARS)
  let authors = delimitAuthors(tweet.authors, MAX_AUTHORS)
  let url = tweet.url
  let topic = tweet.topic

  let result = ""
  result += 'Topic: ' + topic + '\n'
  result += 'Title: ' + title + '\n'
  result += 'Authors: '
  for (author_index in authors){
    if (authors[author_index] == "ETAL"){
      result += "et al."
    }
    else{
      result += '@' + authors[author_index] + ', '
    }
  }
  result += '\n'
  result += url
  return result
}

function delimitTitle(title, charAmount){
  if (title.length <= charAmount){
    return title
  }
  else {
    let currentIndex = charAmount - 1
    while (title[currentIndex] != ' '){
      currentIndex--
    }
    return title.substring(0, currentIndex) + '...'
  }
}


function delimitAuthors(authors, amount){
  if (authors.length > amount){
    authors = [authors[0], "ETAL"]
  }
  return authors
}






let app = express()
app.use(fileUpload())

//  Checks whether the user has an open session (cookie)
app.get('/session', (req, res) => {

})

app.post('/upload', (req, res) => {
  let file = req.files.file
  console.log('Received ' + file.name)
  enqueue(file)
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

app.get('/auth', (req, res) => {
  let _oauth = {
    callback: REDIRECT_URI,
    consumer_key: oauth.consumer_key,
    consumer_secret: oauth.consumer_secret
  }
  request.post({
    url: 'https://api.twitter.com/oauth/request_token',
    oauth: _oauth
  })
  .then(result => {
    console.log(result)
  	let pieces = result.split('&')
    let oauth_token = pieces[0].split('=')[1]
    let oauth_token_secret = pieces[1].split('=')[1]
    let callback_confirmed = pieces[2].split('=')[1]

    if (callback_confirmed == 'true'){
      res.redirect('https://api.twitter.com/oauth/authorize?oauth_token=' + oauth_token)
    }else{
      res.send("CALLBACK NOT CONFIRMED!")
    }
  })
  .catch(err => {
    console.log('Err ' + err)
    res.send("erroretzue pase da :)")
  })
})

app.get('/callback', (req, res) => {
  console.log(req.query)
  console.log('\n')
  let _oauth = {
    consumer_key: oauth.consumer_key,
    token: req.query.oauth_token,
    verifier: req.query.oauth_verifier
  }
  request.post({
    url: 'https://api.twitter.com/oauth/access_token',
    oauth: _oauth
  })
  .then(result => {
    console.log(result)
    let pieces = result.split('&')
    let oauth_token = pieces[0].split('=')[1]
    let oauth_token_secret = pieces[1].split('=')[1]
    let user_id = pieces[2].split('=')[1]
    let screen_name = pieces[3].split('=')[1]
    oauth.access_token = oauth_token
    oauth.access_token_secret = oauth_token_secret
    res.send('Welcome ' + screen_name)
    test()
  })
  .catch(err => {
    res.send(err)
  })
})


function enqueue(file){
  return new Promise((resolve, reject) => {
    d = new Date()
    year = d.getFullYear()
    month = d.getMonth() + 1
    day = d.getDate()
    hour = d.getHours()
    minute = d.getMinutes()
    second = d.getSeconds()
    filename = year + '_' + month + '_' + day + '_' + hour + '_' + minute + '_' + second + '.dat'
    console.log('Saved to ' + filename)
    file.mv(DATA_DIR + filename, err => {
      if (err){
        reject({
          status: 500,
          text: err
        })
      }
      else{
        prepareToTweet(filename)
        resolve({
          status: 200,
          text: 'File uploaded!'
        })
      }
    })
  })
}

console.log('Listening on ' + BACK_PORT)
app.listen(BACK_PORT, '192.168.0.10');
