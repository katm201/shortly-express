const parseCookies = (req, res, next) => {
  let parsedCookie = {};
  if (req.headers.cookie !== undefined) {
    let cookies = req.headers.cookie.split('; ');

    for (var i = 0; i < cookies.length; i++) {
      let parsed = cookies[i].split('=');
      parsedCookie[parsed[0]] = parsed[1];
    } 
  }
  req.cookies = parsedCookie;

  next();
};

module.exports = parseCookies;