//load the dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('connect-mysql')(session);
var appconfig =require('./config');
var ejs = require('ejs');
var engine = require('ejs-mate');
var csrf = require('csurf');

//console.log(config);
var options = {
  secret: appconfig.session.secret,
  config: appconfig.db
};

var index = require('./routes/index');
var user = require('./routes/user');
var api=require('./routes/api');
var purchase=require('./routes/purchase');

var app = express();//create an application

// view engine setup
app.set('views', path.join(__dirname, 'views/ejs'));
//app.engine('.html', require('ejs').renderFile);
app.engine('.html', engine);
app.set('view engine', 'html');//app.set('view engine', 'ejs');

console.log(__dirname);



app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));// icon
app.use(logger('dev'));// logging level
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(appconfig.home+'/css',express.static(path.join(__dirname, 'public/css')));
app.use(appconfig.home+'/js',express.static(path.join(__dirname, 'public/js')));
app.use(appconfig.home+'/img',express.static(path.join(__dirname, 'public/img')));
app.use(appconfig.home+'/assets',express.static(path.join(__dirname, 'public/assets')));




app.set('trust proxy', 1) // trust first proxy 
app.use(session({
  store: new MySQLStore(options),
  secret: appconfig.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true, maxAge: null }
}));

var svgCaptcha = require('svg-captcha');
app.use(appconfig.home+'/captcha', function (req, res,next) {
/*生成图形验证码*/
    var captcha = svgCaptcha.create({
      size:6,
      noise:2,
      color: false,
      ignoreChars: '0Oo1il' 
    });
    req.session.answer = captcha.text.toLowerCase();
    res.set('Content-Type', 'image/svg+xml');
    res.send(captcha.data);
});

// check if session already login
app.use(function (req, res, next) {
  console.log("session=" + req.session.id);
  //console.log(req.session.user);
  if (req.session.user != null) {
    res.locals.user = {
      username: req.session.user.username,
      email: req.session.user.email,
      group: appconfig.getUserGroup(req.session.user.groupid)
    };
    //valid group access right
      if(req.path!=appconfig.home+"/user/unauth"){
        if(appconfig.checkAccessRight(req.session.user.groupid,req.path))
          next();
        else{
          res.redirect(appconfig.home+'/user/unauth?path='+req.path);
        }
      }else
        next();
  } else {
    res.locals.user = null;
    switch (req.path) {
      case appconfig.home+"/user/login":
      case appconfig.home+"/user/register":
      case appconfig.home+"/user/resetpassword":
      case appconfig.home+"/user/forgetpassword":
      case appconfig.home+"/api/user":
        next();
        break;
      default:
        res.redirect(appconfig.home+'/user/login');
    }
  }
});
// format locals message if any
app.use(function (req, res, next) {
  var err = req.session.error;
  res.locals.message = '';
  delete req.session.error;
  if (err != null) {
    res.locals.message = err;
  }
  next();
});
//CSRF
app.use(csrf({ 
  cookie: false,
  sessionKey:'session',
  ignoreMethods:['GET', 'HEAD', 'OPTIONS'] 
}));
app.use(function(req, res, next){
    res.locals.csrfSecret = req.csrfToken();
    next();
});
app.use(function (err, req, res, next) {
  console.log(req.headers);
  if (err.code !== 'EBADCSRFTOKEN') return next(err)
        // handle CSRF token errors here
        console.log(err.message); 
        res.status(403)
        res.send('form tampered with:'+err.message)
});
//

app.use(appconfig.home,express.static(path.join(__dirname, 'public')));
app.use(appconfig.home+'/', index);
app.use(appconfig.home+'/user', user);
app.use(appconfig.home+'/api', api);
//app.use(appconfig.home+'/new_request', new_request);
app.use(appconfig.home+'/purchase', purchase);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
