const models = require('../models');
const Promise = require('bluebird');
const cookieParser = require('./cookieParser.js');

module.exports.createSession = (req, res, next) => {
  //create a new session in the db
  //cookie format: shortlyid=<hash>

  new Promise((resolve, reject) => {
    if (req.cookies && req.cookies.hasOwnProperty('shortlyid')) {
      resolve(models.Sessions.get({ hash: req.cookies.shortlyid}));
    } else {
      throw 'No cookie found. Must create new session.';
    }
  }).then(sessionObj => {
    if (sessionObj === undefined) {
      throw 'Malicious cookie. Must create new session';
    } else {
      req.session = sessionObj;
      res.cookie('shortlyid', sessionObj.hash);
      next();
    }
  }).catch(notify => {
    return new Promise((resolve, reject) => {
      resolve(models.Sessions.create());
    }).then(results => {
      return models.Sessions.get({ id: results.insertId });
    }).then(results => {
      let cookieHash = results.hash;
      req.session = results;
      res.cookie('shortlyid', cookieHash);
      next();
    });
  });
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.authenticateUser = (req, res, next) => {
  return new Promise(function(resolve, reject) {
    resolve(models.Sessions.get({ hash: req.session.hash }));
  }).then(function(results) {
    if (results.userId === null) {
      res.redirect(301, '/login');
    }
    next();
  });
};

module.exports.associateCookie = (req, res, next) => {
  let cookieHash = req.session.hash;
  let userId = req.session.userId;
  console.log('cookie hash: ', cookieHash);
  console.log('userid: ', userId);
  let options = {
    hash: cookieHash
  };
  let values = {
    userId: userId
  };
  return new Promise((resolve, reject) => {
    resolve(models.Sessions.update(options, values));
  }).then(results => {
    next();
  });
};

module.exports.authenticateCredentials = (req, res, next) => {
  let username = req.body.username;
  let attemptedPassword = req.body.password;
  new Promise(function(resolve, reject) {
    let options = {
      username: username
    };
    resolve(models.Users.get(options));
  })
  .then( user => {
    if (user) {
      console.log('IN LOGIN, USER GET INTO', user);
      let salt = user.salt;
      let passwordHash = user.password;
      req.user = user;
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
      console.log('Successful authentication, session into ', req.session);
      req.session.userId = req.user.id;
      req.session.user = req.user;
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

    req.session.userId = results.insertId;

    next();
  }).catch(err => {
    console.log('redirect to signup');
    res.redirect(301, '/signup');
  });
};





