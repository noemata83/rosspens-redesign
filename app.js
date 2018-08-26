const express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    Pen = require("./models/pen"),
    User = require("./models/user"),
    Article = require('./models/article'),
    localStrategy = require('passport-local'),
    passport = require('passport'),
    methodOverride = require('method-override'),
    aws = require('aws-sdk'),
    getTitles = require('./helpers/getTitles'),
    expressSanitizer = require('express-sanitizer'),
    session = require('express-session'),
    buildMenu = require('./helpers/buildMenu');
const MongoDBStore = require('connect-mongodb-session')(session);

// USE ROUTES
const penRoutes = require('./routes/pen'),
      indexRoutes = require('./routes/index'),
      makerRoutes = require('./routes/maker'),
      aboutRoutes = require('./routes/about'),
      messageRoutes = require('./routes/message');


global.articleTitles = [];
global.penTypes = [];

// APP CONFIG

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASEURL, { useMongoClient: true });

const store = new MongoDBStore({
    uri: process.env.DATABASEURL,
    collection: 'rosspens-sessions'
});

store.on('connected', () => {
    store.client;
});

store.on('error', error => {
    assert.ifError(error);
    assert.ok(false);
  });

app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(__dirname + "/public/"));
app.use(bodyParser.urlencoded({ extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(expressSanitizer());

const S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'us-east-1';

app.use(require("express-session")({ 
    secret: process.env.SECRET,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: store,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

getTitles().then( titles => {
    global.articleTitles = [...titles];
});

// Pen.distinct('maker', (err, result) => {
//     if (err) console.log(err);
//     console.log(result);
// });

app.use(async function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.articles = global.articleTitles;
    res.locals.menuData = await buildMenu();
    next();
});

app.use('/', indexRoutes);
app.use('/pens', penRoutes);
app.use('/makers', makerRoutes);
app.use('/about', aboutRoutes);
app.use('/admin/message', messageRoutes);
// seed_and_test();

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

app.get('/sign-s3-article', (req, res) => {
    const s3 = new aws.S3();
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
        Bucket: S3_BUCKET,
        Key: 'images/articles/' + fileName,
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
            url: `https://${S3_BUCKET}.s3.amazonaws.com/images/articles/${fileName}`
        };
        
        res.write(JSON.stringify(returnData));
        res.end();
    });
});

app.get('/404', (req, res) => {
    res.render('404', {url : "The page you were looking for"});
})

app.use(function(req, res, next) {
    res.format({
    html: function () {
      res.render('404', { url: req.url })
    },
    json: function () {
      res.json({ error: 'Not found' })
    },
    default: function () {
      res.type('txt').send('Not found')
    }
  });
});

app.listen(process.env.PORT || 5000, process.env.IP, function() {
    console.log("RossPens server has started.");
});

// const used = process.memoryUsage();
// for (let key in used) {
//     console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
// }
// async function seed_and_test() {
//     await seedDB();
//     getTitles().then(titles => {
//         articleTitles = titles;
//     })
// }