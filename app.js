var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var uuid = require('uuid');

var indexRouter = require('./routes/index');

var app = express();

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'test';

// session set up
app.use(session({
  genid: function (req) {
    return uuid() // use UUIDs for session IDs
  },
  secret: 'some-secret',
  cookie: {
    maxAge: 60000
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// This telling Express to serve static objects from the /public/ dir,
// but to make them actually seem like they're coming from the top level
// (it also does this with the views directory).
// For example, the images directory is C:..\node\sjc\public\images … 
// but it is accessed at http://localhost:3000/images.


app.use('/', indexRouter);


// handler for login request
// at the moment it does nothing
app.post('/login', (req, res) => {
  console.log(req.session);
  res.send();
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
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
