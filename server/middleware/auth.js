const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.authenticateUser = (req, res, next) => {
  // return checkLogin status (async)
  // .then (true/false)
    // if true,
      // next()
    // if false,
    
    // redirect to login page
  res.redirect(301, '/login');
  
  
};

module.exports.authenticateCredentials = (req, res, next) => {
  // return checkUser status (async)
  // .then (present/not present)
    // if not present
      // redirect to the signup page
    // if present
      // keep going
  // .then
    // return checkPW status (async)
  // .then (true/false)
    // if false
      // reject
    // if true
      // redirect to the correct page
  // .catch
    // redirect to the login page
      
};

module.exports.createNewUser = () => {
  // handle new user creation here
  // return check user doesn't exist (async)
  // .then (true/false)
    // if false,
      // reject
    // if true
      // create the user
  // .then
    // redirect to home page
  // .catch
    // redirect to login
};