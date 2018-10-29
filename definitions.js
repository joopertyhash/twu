module.exports = {

  // CONFIGURATION:
  DATA_DIR: 'data/',

  HTML_OPTIONS: {
    root: 'public/'
  },

  // Remember to change in all fields!
  ADDRESS: 'localhost',
  PORT: '8080',
  REDIRECT_URI: 'http://localhost:8080/api/callback',

  CONSUMER_KEYS_PATH: 'consumer_keys.cfg',

  SESSION_KEY_SIZE: 16,

  TWEET_INTERVAL: 10, // in seconds





  // ERRORS:
  NO_SESSION: "You have not been logged in.\n",
  CALLBACK_NOT_CONFIRMED: "Callback URI not confirmed. Go to the App settings.\n",
  INTERNAL_ERROR: "Internal error.\n",
  CALLBACK_VERIFICATION_ERROR: "Error at verifying the callback.\n",
  TWEETING_ERROR: "Could not tweet.\n"
}
