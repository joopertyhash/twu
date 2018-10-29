const fs = require('fs')

const DEFS = require('./definitions')

module.exports = {
  parse: function(filename) {
    return parse(filename)
  },
  writeConsumerKeys: function(config){
    return writeConsumerKeys(config)
  },
  readConsumerKeys: function(){
    return readConsumerKeys()
  }
};



function parse(filename){
  return new Promise((resolve, reject) => {
    let contents = fs.readFile(filename, 'utf8', (err, data) => {
      if (!err){
        let lines = data.split('\r\n')
        let tweets = []
        for (line_index in lines){
          let tweet = lines[line_index]
          // console.log(tweet)
          if (tweet == ''){ // Ignore last emtpy newline
            break
          }else{
            if (check(tweet)){
              tweets.push(tweet)
            }
          }
        }
        resolve(tweets)
      }
      else{
        reject(err)
      }
    })
  })
}


function check(line){
  // Hello good people over the Internet
  return true
}



//  DONT MAKE THESE ASYNC AS PROGRAM NEEDS TO WAIT FOR THEM
function writeConsumerKeys(config){
  let config_file = fs.openSync(DEFS.CONSUMER_KEYS_PATH, 'w')
  fs.appendFileSync(config_file, JSON.stringify(config), 'utf8')
  fs.closeSync(config_file)
}

function readConsumerKeys(){
  let contents = fs.readFileSync(DEFS.CONSUMER_KEYS_PATH, 'utf8');
  return JSON.parse(contents)
}
