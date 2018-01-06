const express = require('express'),
      passport = require('passport'),
      User = require('../models/user');
    
const router = express.Router();

// Landing route
router.get("/", function(req, res) {
   res.render("landing"); 
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
        if (user.length !== 0) {
            res.render('login');
        }
        else {
            let adminUser = new User({ username: req.body.username, admin: true});
            User.register(adminUser, req.body.password, (err, user) => {
                if (err) {
                    console.log(err);
                }
                passport.authenticate("local")(req, res, () => res.redirect("/admin/dashboard"));
            });
    }
});

// Admin signin page
router.get("/admin", function(req,res){
   res.render("login"); 
});

router.get("/admin/dashboard", isLoggedIn, function(req, res){
    res.render("dashboard");
})

// Admin login route
router.post("/login", passport.authenticate("local", {
    successRedirect: "/admin/dashboard",
    failureRedirect: "/admin"
}), function(req, res) {});

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("back");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin');
}

module.exports = router;