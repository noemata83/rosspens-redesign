const express = require('express'),
      passport = require('passport'),
      User = require('../models/user'),
      Message = require('../models/message'),
      Pen = require('../models/pen'),
      isLoggedIn = require('../helpers/isLoggedIn');

    
const router = express.Router();

// Landing route
router.get("/", (req, res) => {
    Message.find({}).sort('-dateAdded').limit(1).exec((err, message) => {
        if (err) {
            res.send("Something went wrong. Please try your request again. If the problem persists, contact the system administrator.");
        } else {
            Pen.find().sort('-dateAdded').limit(4).exec((err, pens) => {
                if (err) {
                    res.send("Something went wrong. Please try your request again. If the problem persists, contact the system administrator.");
                } else {
                    res.render('landing', {message: message[0], pens: pens });
                }
            })
                    
        }
    })
    
});

// Admin account creation

router.get("/createadminuser", (req, res) => {
    User.find({ "admin": true }, (err, user) => {
       if (err || user.length === 0) {
           res.render('createadmin');
       } else {
        res.redirect('/admin/dashboard');
        } 
    });
});

router.post("/createadminuser", (req, res) => {
    User.find({"admin": true }, (err, user) => {
        if (err || user.length !== 0) {
            res.render('login');
        }
        else {
            let adminUser = new User({ username: req.body.username, admin: true});
            User.register(adminUser, req.body.password, (err, newUser) => {
                if (err) {
                    console.log(err);
                }
                passport.authenticate("local")(req, res, () => res.redirect("/admin/dashboard"));
            });
        }
    });
});

// Admin signin page
router.get("/admin", function(req,res){
   res.render("login"); 
});

router.get("/admin/dashboard", isLoggedIn, function(req, res){
    res.render("admin/dashboard");
});

router.get("/admin/pens", isLoggedIn, (req, res) => {
    Pen.find({}, function(err, pens) {
        if (err){
            res.send("There was an error.");
        } else {
            res.render("admin/index", { pens: pens});
        }
    });
})

// Admin login route
router.post("/login", passport.authenticate("local", {
    successRedirect: "/admin/dashboard",
    failureRedirect: "/admin"
}), function(req, res) {});

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

module.exports = router;