const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/', /*auth middleware, */ (req, res) => {
  //
  res.render('index');
});

app.get('/create', 
(req, res) => {
  res.render('index');
});

app.post('/login', 
(req, res) => {
  // authenticate credentials
});

app.post('/signup', 
(req, res) => {
  // add user
});

app.get('/links',
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});



app.post('/links', 
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

authenticateUser = (req, res, next) => {
  // return checkLogin status (async)
  // .then (true/false)
    // if true,
      // next()
    // if false,
    // redirect to login page
  
  
};

authenticateCredentials = (req, res, next) => {
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

createNewUser = () => {
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
/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;