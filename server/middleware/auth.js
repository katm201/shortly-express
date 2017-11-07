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
  let username = req.body.username;
  let attemptedPassword = req.body.password;
  // return checkUser status (async)
  return new Promise(function(resolve, reject) {
    let options = {
      username: username
    };
    console.log('in original promise: ', options);
    resolve(models.Users.get(options));
    // return models.Users.get(options);
  })
  .then( user => {
    console.log('made it past get');
    let salt = user.salt;
    let passwordHash = user.password;
    console.log('before compare users: ', user);
    return models.Users.compare(attemptedPassword, passwordHash, salt);
  })
  .then( bool => {
    console.log('after compare ', bool);
    if (!bool) {
      console.log('Failed authentication, please sign up');
      res.redirect(301, '/signup');
    } else {
      console.log('Successful authentication');
      next();
    }
  })
  .catch( err => console.log('FAILED to login ', err));
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

module.exports.createNewUser = (req, res, next) => {
  // handle new user creation here
  // return check user doesn't exist (async)
  // .then (true/false)
    // if false,
      // reject
    // if true
      // create the user
  let username = req.body.username;
  let password = req.body.password;
  
  return new Promise((resolve, reject) => {
    resolve(models.Users.create({ username: username, password: password }));
  }).then(results => {
    console.log('new user created, redirect to home page');
    next();
  }).catch(err => {
    res.redirect(301, '/login');
  });
  // .then
    // redirect to home page
  // .catch
    // redirect to login
};





