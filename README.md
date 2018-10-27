# AutoPoster

AutoPoster is a Javascript application that creates a web server and lets the user upload a file for the application to automatically post tweets with its contents.

## Usage

Run the app by typing *node app.js* on a command line in the project directoty.

Go to http://localhost:8080

Click on **Log in with Twitter* and authorize yourselves. 'kaizo' will be tweeted if successful, delete it for next authorization, as it will throw an error telling duplicate status.

Click on **upload**. Select a file (See <file format>) and upload it. Every 15 seconds a new tweet should be posted if no errors occur.

## File format

Data must be written in **UTF-8** into a **plain-text** file.
Each line will represent the contents of the tweet and line breaks have to be represented as CRLF (\r\n)
An empty line will mark the end of the file.

### Limits

First of all, the Twitter limitations will be applied, obviously.
20 lines (plus an empty one) will be the maximum size of the file.

That means: 20 lines max * 140 characters max per line + 42 special characters (CR and LF) max = 2842 bytes max

## TODO list

* See if the use of Oauth v1.0 can be reinforced for authorization (using nonces...)
* Create User class and use a database to store User data.
* Limit file size to 2842 bytes. Check both in client and server side.
* Create error mechanisms. Document internal errors in *definitions.js*
* Implement a general queue for all pending tweets to be uploaded.
* (Related to the previous) Let users know when their tweet will be published.
* Make a prettier front-end, for the love of dogo.

## Current issues

* Line breaks cannot be inserted into tweets yet. (Which one-character-long mark?)
* Session cookie is saved before authorization callback. Must check if the user has been really authorized.
* General [request.js](https://github.com/request/request)/[express.js](https://expressjs.com/) issues