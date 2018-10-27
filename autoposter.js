const request = require('request-promise-native')

const DEFS = require('./definitions.js')
const io = require('./io')

module.exports = {
  enqueue: function(file, user) {
    return enqueue(file, user)
  },
  tweet: function(text, user){
    return tweet(text, user)
  },

  authorize: function(){
    return authorize()
  },
  callback: function(token, verifier, currentUser){
    return callback(token, verifier, currentUser)
  }
}

const CONSUMER_KEYS = io.readConsumerKeys()


function enqueue(file, user){
  return new Promise((resolve, reject) => {
    // apply rate limiting...
    // get user from session
    username = user.name
    d = new Date()
    year = d.getFullYear()
    month = d.getMonth() + 1 // getMonth() takes January as 0
    day = d.getDate()
    hour = d.getHours()
    minute = d.getMinutes()
    second = d.getSeconds()
    filename = username + '_' + year + '_' + month + '_' + day + '_' + hour + '_' + minute + '_' + second + '.dat'
    console.log('Saved to ' + filename)
    file.mv(DEFS.DATA_DIR + filename, err => {
      if (err){
        reject({
          status: 500,
          text: err
        })
      }
      else{
        prepareToTweet(filename, user)
        resolve({
          status: 200,
          text: 'File uploaded!'
        })
      }
    })
  })
}

async function prepareToTweet(filename, user){
  let tweets = io.parse(DEFS.DATA_DIR + filename)
  for (i in tweets){
    tweet(tweets[i], user)
    await sleep(15000)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function tweet(text, user) {
  let oauth = {
    consumer_key: CONSUMER_KEYS.key,
    consumer_secret: CONSUMER_KEYS.secret,
    token: user.token,
    token_secret: user.secret
  }
  request.post({
    url: 'https://api.twitter.com/1.1/statuses/update.json',
    form: {
      status: text
    },
    oauth: oauth
  })
  .then(result => {
    console.log('Tweeted!')
    // console.log(result)
  })
  .catch(err => console.log(err))
}


function authorize(){
  return new Promise((resolve, reject) => {
    let oauth = {
      callback: DEFS.REDIRECT_URI,
      consumer_key: CONSUMER_KEYS.key,
      consumer_secret: CONSUMER_KEYS.secret
    }
    request.post({
      url: 'https://api.twitter.com/oauth/request_token',
      oauth: oauth
    })
    .then(result => {
    	let pieces = result.split('&')
      let token = pieces[0].split('=')[1]
      let token_secret = pieces[1].split('=')[1]
      let callback_confirmed = pieces[2].split('=')[1]

      if (callback_confirmed == 'true'){
        resolve(token)
      }else{
        reject("CALLBACK NOT CONFIRMED!")
      }
    })
    .catch(err => {
      reject("erroretzue pase da :)")
    })
  })
}


function callback(token, verifier, currentUser){
  return new Promise((resolve, reject) => {
    let oauth = {
      consumer_key: CONSUMER_KEYS.key,
      token: token,
      verifier: verifier
    }
    request.post({
      url: 'https://api.twitter.com/oauth/access_token',
      oauth: oauth
    })
    .then(result => {
      // console.log(result)
      let pieces = result.split('&')
      let token = pieces[0].split('=')[1]
      let token_secret = pieces[1].split('=')[1]
      let user_id = pieces[2].split('=')[1]
      let screen_name = pieces[3].split('=')[1]

      currentUser.token = token
      currentUser.secret = token_secret
      currentUser.name = screen_name

      // console.log(currentUser)
      resolve(currentUser)
    })
    .catch(err => {
      reject(err)
    })
  })
}
