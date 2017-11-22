var express = require('express');
var router = express.Router();
var Pen = require('../models/pen');
var multer = require('multer');
var upload = multer({ dest: 'public/assets/images'});
var fs = require('fs');

var storage = multer.diskStorage({
destination: function (req, file, cb) {
 cb(null, './public/assets/images');
    },
 filename: function (req, file, cb) {
    filename = file.originalname;
    cb(null, filename);
  }
});

router.get("/", function(req, res) {
    Pen.find({}, function(err, pens) {
        if (err){
            res.send("There was an error.");
        } else {
            res.render("index", { pens: pens, sort: "All"});
        }
    });
});

router.post('/', isLoggedIn, multer({ storage: storage, dest: '/assets/images'}).array('image'), function(req,res, next){
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

router.get("/new", isLoggedIn, function(req,res){
    res.render("new");
});

router.get('/whatsnew', function(req,res){
    Pen.find({}).sort("-dateAdded").limit(10).exec(function(err, pens){
        if (err) {
            res.send("There was an error.");
        } else {
            res.render("index", { pens: pens, sort: "New"});
        }
    })
})

router.get("/type/:type", function(req, res){
   Pen.find({type: req.params.type}, function(err, pens){
       if (err) {
           res.render("index", { pens: []});
       } else {
           res.render("index", { pens: pens, sort: req.params.type });
       }
   }) 
});

router.get("/:id", function(req, res) {
    Pen.findById(req.params.id, function(err, foundPen) {
       if (err) {
           res.redirect("/");
       } else {
           res.render("show", { pen : foundPen});
       }
    });
});

router.get("/:id/edit", isLoggedIn, function(req, res){
   Pen.findById(req.params.id, function(err, foundPen){
       if (err) {
           res.redirect('/');
       } else {
           res.render("edit", { pen : foundPen});
       }
   }) 
});

router.put("/:id", isLoggedIn, multer({ storage: storage, dest: '/assets/images'}).array('newimages'), function(req, res) {
    // Retrieve the array of images to be removed from the pen record
    var imagedeletes= [];
    if (req.body.imagechanges) {
        imagedeletes = req.body.imagechanges.split(',').map(x => parseInt(x));
    }
    // Find the pen, delete the images at their paths and splice the entries from the images array.
    Pen.findById(req.params.id, function(err, foundPen) {
    if (err) {
        console.log(err);
        res.redirect('/');
    } else {
        if (imagedeletes.length > 0) {
            imagedeletes.reverse().forEach(function(rmindex) { // reverse the array first, to ensure that the right indexes are spliced!
              fs.unlink("./public" + foundPen.images[rmindex], err => console.log(err));
              foundPen.images.splice(rmindex, 1);
            });
        }
        var images = foundPen.images;
        req.files.forEach(function(file){
            var path = String(file.path).replace("public", "");
            images.push(path);
        });
        var penUpdates = req.body.pen;
        penUpdates['images'] = images;
        Pen.findByIdAndUpdate(req.params.id, penUpdates, function(err, foundPen) { // There *has* to be another way to do this. Find by Id and Update *inside* Find By Id? seems excessive.
            if (err) {
                console.log(err);
            } else {
                res.redirect('/pens/' + foundPen._id);
            }
        });
    }
    });
});

router.delete("/:id", function(req, res) {
    // Locate the pen record to be deleted and delete all of the images.
    Pen.findById(req.params.id, function(err, foundPen) {
        if(err) {
            console.log(err);
        } else {
            foundPen.images.forEach(function(filepath) {
                fs.unlink("./public" + filepath, function(err) {
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

router.get("/:maker/:type", function(req, res){
   Pen.find({maker: req.params.maker, type: req.params.type}, function(err, pens) {
        if (err) {
            res.render("index", { pens: [] });
        }
        else {
            res.render("index", { pens : pens, sort: req.params.maker });
        }
    }); 
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin');
}

module.exports = router;