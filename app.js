var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    Pen = require("./models/pen"),
    User = require("./models/user"),
    multer = require('multer'),
    upload = multer({ dest: 'public/assets/images'}),
    localStrategy = require('passport-local'),
    passport = require('passport'),
    methodOverride = require('method-override'),
    fs = require('fs');

// USE ROUTES
var penRoutes = require('./routes/pen');
var indexRoutes = require('./routes/index');

// APP CONFIG

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/rosspens", { useMongoClient: true });
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(__dirname + "/public/"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));


// PASSPORT CONFIG 
var fileName = "./config/session-config.json";
var config;

try {
  config = require(fileName);
}
catch (err) {
  config = {};
  console.log("unable to read file '" + fileName + "': ", err);
}

app.use(require("express-session")(config));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.use('/', indexRoutes);
app.use('/pens', penRoutes);

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("RossPens server has started.");
});