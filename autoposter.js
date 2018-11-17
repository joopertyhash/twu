const request = require('request-promise-native')

const DEFS = require('./definitions.js')
const io = require('./io')

module.exports = {
  getPendingTweets: (tweeterID) => {
    return getPendingTweets(tweeterID)
  },
  getErrors: (tweeterID) => {
    return getErrors(tweeterID)
  },

  enqueue: function(file, user) {
    return enqueue(file, user)
  },
  startDequeueing: function(){
    dequeue()
  },

  authorize: function(){
    return authorize()
  },
  callback: function(token, verifier, currentUser){
    return callback(token, verifier, currentUser)
  },

  tweet: function(text, user){
    return tweet(text, user)
  }

}

const CONSUMER_KEYS = io.readConsumerKeys()



let queue = []
let errors = []
let nextTweetTime = null


function getPendingTweets(tweeterID){
  let userTweets = []
  for (let i = 0; i < queue.length; i++){
    if (queue[i].user == tweeterID){
      userTweets.push(queue[i])
    }
  }
  return userTweets;
}

function getErrors(tweeterID){
  let userErrors = []
  for (let i = 0; i < errors.length; i++){
    if (errors[i].user == tweeterID){
      userErrors.push(errors[i])
    }
  }
  return userErrors;
}


function enqueue(file, user){
  return new Promise((resolve, reject) => {
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
          status: 420,
          text: err
        })
      }
      else{
        io.parse(DEFS.DATA_DIR + filename)
        .then(tweets => {
          for (let i = 0; i < tweets.length; i++){
            // console.log(new Date(nextTweetTime + queue.length * DEFS.TWEET_INTERVAL * 1000))
            let dueTime = new Date(nextTweetTime + queue.length * DEFS.TWEET_INTERVAL * 1000).toTimeString().split(' ')[0] // Get only hh:mm:ss

            queue.push({
              tweet: tweets[i],
              user: user.tweeterID,
              time: dueTime
            })
          }
          resolve({
            status: 200,
            text: 'File uploaded!'
          })
        })
        .catch(err => reject({
          status: 420,
          text: err
        }))
      }
    })
  })
}

async function dequeue(){
  while (true){
    console.log('Dequeueing...')
    if (queue.length != 0){
      let dequeued = queue.shift()
      // tweet(dequeued.tweet, dequeued.user)
      console.log(dequeued)
    }
    nextTweetTime = new Date().getTime() + DEFS.TWEET_INTERVAL * 1000
    await sleep(DEFS.TWEET_INTERVAL * 1000)
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
  .catch(err => {
    user.errors.push({
      type: DEFS.TWEETING_ERROR,
      what_failed: tweet
    })
  })
  console.log(DEFS.TWEETING_ERROR + err)
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
        reject(DEFS.CALLBACK_NOT_CONFIRMED)
      }
    })
    .catch(err => {
      reject(DEFS.INTERNAL_ERROR + err)
    })
  })
}


function callback(token, verifier, sessionKey){
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
      let secret = pieces[1].split('=')[1]
      let user_id = pieces[2].split('=')[1]
      let screen_name = pieces[3].split('=')[1]

      let currentUser = {
        sessionKey: sessionKey,
        tweeterID: user_id,
        name: screen_name,
        token: token,
        secret: secret
      }

      // console.log(currentUser)
      resolve(currentUser)
    })
    .catch(err => {
      reject(DEFS.CALLBACK_VERIFICATION_ERROR + err)
    })
  })
}
