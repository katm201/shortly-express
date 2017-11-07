const models = require('../models');
const Promise = require('bluebird');
const cookieParser = require('./cookieParser.js');

module.exports.createSession = (req, res, next) => {
  //create a new session in the db
  //cookie format: shortlyid=<hash>
  
  if (!req.cookie || !req.cookie.hasOwnProperty('shortlyid')) {
    return new Promise((resolve, reject) => {
      resolve(models.Sessions.create());
    }).then(results => {
      console.log('sessionId', results.insertId);
      return models.Sessions.get({ id: results.insertId});
    }).then(results => {
      console.log('results ', results);
      res.cookie('shortlyid', results.hash);
      console.log('cookie created: ', req.cookies );
      next();
    });
  } else {
    next();  
  }
  
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.authenticateUser = (req, res, next) => {
  return new Promise(function(resolve, reject) {
    resolve(models.Sessions.get({ hash: req.cookie.shortlyid }));
  }).then(function(results) {
    if (results.userId === null) {
      res.redirect(301, '/login');
    }
    next();
  });
};

var associateCookie = (cookieHash, userId) => {
  console.log('cookie hash: ', cookieHash);
  console.log('userid: ', userId);
  let options = {
    hash: cookieHash
  };
  let values = {
    userId: userId
  };
  return models.Sessions.update(options, values);
};


module.exports.authenticateCredentials = (req, res, next) => {
  let username = req.body.username;
  let attemptedPassword = req.body.password;
  return new Promise(function(resolve, reject) {
    let options = {
      username: username
    };
    resolve(models.Users.get(options));
  })
  .then( user => {
    if (user) {
      let salt = user.salt;
      let passwordHash = user.password;
      req.userId = user.id;
      return models.Users.compare(attemptedPassword, passwordHash, salt); //resolve
    }
  })
  .then( bool => {
    // sends to login page for users that either don't exit in the
    // database or for users that fail their password check
    if (!bool) {
      console.log('Failed authentication, please sign up');
      res.redirect(301, '/login');
    } else {
      console.log('Successful authentication');
      associateCookie(req.cookies.shortlyId, req.userId);
      next();
    }
  })
  .catch( err => console.log('FAILED to login ', err));
};

module.exports.createNewUser = (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  
  return new Promise(function(resolve, reject) {
    let options = {
      username: username
    };
    resolve(models.Users.get(options));
  }).then(user => {
    console.log('USER', user);
    if (user !== undefined) {
      reject();
    } else {
      return models.Users.create({ username: username, password: password });
    }
  }).then(results => {
    console.log('CREATE USER RESULT ', results);
    console.log('new user created, need to associate cookies with login');
    console.log('cookies', req.cookies);
    console.log('results.insertId', results.insertId);
    associateCookie(req.cookies.shortlyid, results.insertId);
    console.log('cookie associated');
    next();
  }).catch(err => {
    console.log('redirect to signup');
    res.redirect(301, '/signup');
  });
};





