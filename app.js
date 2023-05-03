var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require("express-handlebars");
var fileUpload=require('express-fileupload')
var  db =require('./config/connection')
var session = require('express-session')
let Handlebars=require('handlebars')
// const multer = require('multer');

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');

var app = express();

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs", 
    defaultLayout: "user-layout",
    layoutsDir: __dirname + "/views/layout",
    partialsDir: __dirname + "/views/partials",
  })
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());


// session  use
app.use(session({secret:"key",cookie:{maxAge:600000}}))

//db connection
db.connect((err)=>{
  if(err) console.log("connection err"+err)
  else console.log("database connected")

})



app.use('/admin', adminRouter);
app.use('/', usersRouter);


// const upload = multer({ 
//   storage: storage,
//   limits: { fileSize: 1000000 },
//   fileFilter: function (req, file, cb) {
//     // check file types here
//     cb(null, true);
//   } 
// }).array('banners', 2);

// const upload = multer({ storage: storage });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
