module.exports = class User {

  constructor(sessionKey, name, token, secret){
    this.sessionKey = sessionKey
    this.name = name
    this.token = token
    this.secret = secret

    this.errors = []
    this.tweets = []
  }

}
