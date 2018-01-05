var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    Pen = require("./models/pen"),
    User = require("./models/user"),
    localStrategy = require('passport-local'),
    passport = require('passport'),
    methodOverride = require('method-override'),
    aws = require('aws-sdk');

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

const S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'us-east-1';

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

// AWS Logic

app.get('/sign-s3', (req, res) => {
    const s3 = new aws.S3();
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
        Bucket: S3_BUCKET,
        Key: 'images/' + fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };
    
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
            console.log(err);
            return res.end();
        }
        
        const returnData = {
            signedRequest: data,
            url: `https://${S3_BUCKET}.s3.amazonaws.com/images/${fileName}`
        };
        
        res.write(JSON.stringify(returnData));
        res.end();
    });
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("RossPens server has started.");
});