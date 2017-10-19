var express = require('express'),
    passport = require('passport');
var router = express.Router();

// Landing route
router.get("/", function(req, res) {
   res.render("landing"); 
});

// Admin signin page
router.get("/admin", function(req,res){
   res.render("login"); 
});

// Admin login route
router.post("/login", passport.authenticate("local", {
    successRedirect: "/pens",
    failureRedirect: "/admin"
}), function(req, res) {});

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("back");
});

module.exports = router;