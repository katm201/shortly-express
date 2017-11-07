const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  //create a new session in the db
  //cookie format: shortlyid=<hash>
  return new Promise((resolve, reject) => {
    let options = {
      userId: req.userId
    };
    resolve(models.Sessions.create(options));
  }).then(results => {
    let sessionId = results.insertId;
    req.sessionId = sessionId;
    let options = {
      id: sessionId,
    };
    let values = {
      userId: req.userId
    };
    return models.Sessions.update(options, values);
  }).then(results => {
    console.log('sessionId', req.sessionId);
    console.log('userId', req.userId);
    return models.Sessions.get({ id: req.sessionId });
  }).then(results => {
    console.log('results ', results);
    res.cookie('shortlyid', results.hash);
    next();
  });
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
      // res.cookie('ImACookie');
      next();
    }
  })
  .catch( err => console.log('FAILED to login ', err));
};

// module.exports.setCookie = (req, res, next) => {
//   //create a new session in the db
//   //cookie format: shortlyid=<hash>
//   return new Promise((resolve, reject) => {
//     let options = {
//       userId: req.userId
//     };
//     resolve(models.Sessions.create(options));
//   }).then(results => {
//     let sessionId = results.insertId;
//     req.sessionId = sessionId;
//     let options = {
//       id: sessionId,
//     };
//     let values = {
//       userId: req.userId
//     };
//     return models.Sessions.update(options, values);
//   }).then(results => {
//     console.log('sessionId', req.sessionId);
//     console.log('userId', req.userId);
//     return models.Sessions.get({ id: req.sessionId });
//   }).then(results => {
//     console.log('results ', results);
//     res.cookie('shortlyid', results.hash);
//     next();
//   });
// };

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
  
  return new Promise(function(resolve, reject) {
    let options = {
      username: username
    };
    resolve(models.Users.get(options));
  }).then(user => {
    console.log('USER', user);
    if (user !== undefined) {
      console.log('about to reject');
      reject();
    } else {
      console.log('about to create');
      console.log('username: ', username);
      console.log('password: ', password);
      return models.Users.create({ username: username, password: password });
    }
  }).then(results => {
    console.log('new user created, redirect to home page');
    next();
  }).catch(err => {
    console.log('redirect to signup');
    res.redirect(301, '/signup');
  });
  
  // return new Promise((resolve, reject) => {
  //   resolve(models.Users.create({ username: username, password: password }));
  // }).then(results => {
  //   console.log('new user created, redirect to home page');
  //   next();
  // }).catch(err => {
  //   res.redirect(301, '/login');
  // });
};





