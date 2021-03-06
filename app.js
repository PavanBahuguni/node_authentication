//node_modules libraries
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var connectMongo = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy=require('passport-local').Strategy;
var flash=require('connect-flash');
var mongoose=require('mongoose');
var expressValidator=require('express-validator')
var app = module.exports=express();
//Importing custom environment(development || production) configuration module
var config=require('./config/config.js');


var routes = require('./routes/index');
var users = require('./routes/users');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');




// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Passport configuration
app.use(passport.initialize());
app.use(passport.session());

//Form validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Flash-connect module setup
app.use(flash());

//express-messages setup
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
app.get('*', function(req, res, next){
   res.locals.user=req.user||null;
   next();
})
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



//Use port by reading to environment variable(this will be helpful during producrion) 
app.listen(process.env.PORT || 3000, function(){
	console.log("Server started listening on:",(process.env.PORT||3000));
});
