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

console.log("session secret is:", config.secret)

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

var storage = multer.diskStorage({
destination: function (req, file, cb) {
 cb(null, './public/assets/images');
    },
 filename: function (req, file, cb) {
    filename = file.originalname;
    cb(null, filename);
  }
});

app.get("/", function(req, res) {
   res.render("landing"); 
});

app.get("/pens", function(req, res) {
    Pen.find({}, function(err, pens) {
        if (err){
            res.send("There was an error.");
        } else {
            res.render("index", { pens: pens, sort: "All"});
        }
    });
});

app.post('/pens', isLoggedIn, multer({ storage: storage, dest: '/assets/images'}).array('image'), function(req,res, next){
    var images = [];
    req.files.forEach(function(file){
        var path = String(file.path).replace("public", "");
        images.push(path);
    });
    var newPen = {
        itemid: req.body.itemid,
        maker: req.body.maker,
        model: req.body.model,
        type: req.body.type,
        year: req.body.year,
        price: req.body.price,
        images: images,
        description: req.body.description,
    };
    Pen.create(newPen, function(err, newlyCreated){
        if (err){
            console.log(err);
        } else {
            res.redirect('/pens/' + req.body.maker + "/" + req.body.type);
        }
    });
});

app.get("/pens/new", isLoggedIn, function(req,res){
    res.render("new");
});

app.get('/pens/whatsnew', function(req,res){
    Pen.find({}).sort("-dateAdded").limit(10).exec(function(err, pens){
        if (err) {
            res.send("There was an error.");
        } else {
            res.render("index", { pens: pens, sort: "New"});
        }
    })
})

app.get("/pens/type/:type", function(req, res){
   Pen.find({type: req.params.type}, function(err, pens){
       if (err) {
           res.render("index", { pens: []});
       } else {
           res.render("index", { pens: pens, sort: req.params.type });
       }
   }) 
});

app.get("/pens/:id", function(req, res) {
    Pen.findById(req.params.id, function(err, foundPen) {
       if (err) {
           res.redirect("/");
       } else {
           res.render("show", { pen : foundPen});
       }
    });
});

app.get("/pens/:id/edit", isLoggedIn, function(req, res){
   Pen.findById(req.params.id, function(err, foundPen){
       if (err) {
           res.redirect('/');
       } else {
           res.render("edit", { pen : foundPen});
       }
   }) 
});

app.put("/pens/:id", isLoggedIn, multer({ storage: storage, dest: '/assets/images'}).array('image'), function(req, res) {
    var imagechanges = req.body.imagechanges.split(',').map(x => parseInt(x));
   Pen.findByIdAndUpdate(req.params.id, req.body.pen, function(err, updatedPen) {
       if (err) {
           res.redirect("/");
       } else {
           res.redirect("/pens/" + updatedPen._id);
       }
   });
});

app.delete("/pens/:id", function(req, res) {
    // Locate the pen record to be deleted and delete all of the images.
    Pen.findById(req.params.id, function(err, foundPen) {
        if(err) {
            console.log(err);
        } else {
            foundPen.images.forEach(function(filepath) {
                fs.unlink(__dirname + "/public" + filepath, function(err) {
                    if(err) {
                        console.log(err)
                    }});
                });
            }
        });
    // Delete pen record
    Pen.findByIdAndRemove(req.params.id, function(err){
        if (err) {
            console.log(err)
        } else {
            res.redirect('/pens');
        }
    })
});

app.get("/pens/:maker/:type", function(req, res){
   Pen.find({maker: req.params.maker, type: req.params.type}, function(err, pens) {
        if (err) {
            res.render("index", { pens: [] });
        }
        else {
            res.render("index", { pens : pens, sort: req.params.maker });
        }
    }); 
});


app.get("/admin", function(req,res){
   res.render("login"); 
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/admin"
}), function(req, res) {});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("RossPens server has started.")
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin');
}
