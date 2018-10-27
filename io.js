const fs = require('fs')

const DEFS = require('./definitions')

module.exports = {
  parse: function(filename) {
    return parse(filename)
  },
  writeConsumerKeys: function(config){
    writeConsumerKeys(config)
  },
  readConsumerKeys: function(){
    return readConsumerKeys()
  }
};



function parse(filename){
  let contents = fs.readFileSync(filename, 'utf8')
  let lines = contents.split('\r\n')
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
  return tweets
}


function check(line){
  // Hello good people over the Internet
  return true
}



// Should not be used in principle
function writeConsumerKeys(config){
  let config_file = fs.openSync(DEFS.CONSUMER_KEYS_PATH, 'w')
  fs.appendFileSync(config_file, JSON.stringify(config), 'utf8')
  fs.closeSync(config_file)
}

function readConsumerKeys(){
  let contents = fs.readFileSync(DEFS.CONSUMER_KEYS_PATH, 'utf8');
  let config = JSON.parse(contents)
  return config
}
