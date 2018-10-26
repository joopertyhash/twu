module.exports = {
  parse: function(filename) {
    return parse(filename)
  },
  writeConfig: function(config){
    writeConfig(config)
  },
  readConfig: function(){
    return readConfig()
  }
};

const CONFIG_FILEPATH = "config.txt"

const fs = require('fs')


function parse(filename){
  let contents = fs.readFileSync(filename, 'utf8')
  let lines = contents.split('\r\n')
  let tweets = []
  for (line_index in lines){
    if (lines[line_index] != ''){ // Ignore last emtpy newline
      tweets.push(toTweet(lines[line_index]))
    }
  }
  return tweets
}

function toTweet(line){
  let params = line.split('$')
  let result = {
    url: params[0],
    title: params[1],
    authors: params[2].split(','),
    topic: params[3],
    additional: params[4] || null
  }
  return result
}


function writeConfig(config){
  let config_file = fs.openSync(CONFIG_FILEPATH, 'w')
  fs.appendFileSync(config_file, JSON.stringify(config), 'utf8')
  fs.closeSync(config_file)
}

function readConfig(){
  let contents = fs.readFileSync(CONFIG_FILEPATH, 'utf8');
  let config = JSON.parse(contents)
  return config
}
