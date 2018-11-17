# AutoPoster

AutoPoster is a Javascript application that creates a web server and lets the user upload a file for the application to automatically post tweets with its contents.

Tweeting is temporarily disabled for testing purposes. *autoposter.js:116*

## Requirements

This app runs on [Node.js](https://nodejs.org/). Dependencies are listed in *package.json*.
The app requires a [MongoDB](https://www.mongodb.com/) server running locally.

## Usage

Go to *definitions.js* and check the configuration data.

In order to use customer keys, you will need to create a file and call *io.writeCustomerKeys()* with an object in the form of {key: ..., secret: ...}.
Remember to update **CUSTOMER_KEYS** in *definitions.js* with the filepath.

Set the MongoDB server port.

Run the app by typing *node app.js* on a command line in the project directoty.

Go to http://localhost:8080 (if *definitions.js* unchanged).

Click on **Log in with Twitter** and authorize yourselves. 'kaizo' will be tweeted if successful, delete it for next authorization, as it will throw an error telling duplicate status.

Click on **upload**. Select a file (See **File format**) and upload it. Every 15 seconds a new tweet should be posted if no errors occur.

## File format

Data must be written in **UTF-8** into a **plain-text** file.
Each line will represent the contents of the tweet and line breaks have to be represented as CRLF (\r\n).
An empty line must mark the end of the file.

### Limits

First of all, the Twitter limitations will be applied, obviously.
20 lines (plus an empty one) will be the maximum size of the file.

That means: 20 lines max * 140 characters max per line + 42 special characters (CR and LF) max = 2842 bytes max.

## TODO list

* See whether the use of Oauth v1.0 can be reinforced for authorization (using nonces...).
* Apply rate limiting to the amount of uploads.
* Limit file size to 2842 bytes. Check both in client and server side.
* Create a proper error log for the server.
* Create a dynamic error page for the user.
* Make a prettier front-end, for the love of dogo.

## Current issues

* Line breaks cannot be inserted into tweets yet (Which one-character-long mark?).
* General [request.js](https://github.com/request/request)/[express.js](https://expressjs.com/) issues (my bad).
