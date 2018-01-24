const express = require('express');
const router = express.Router();
const Pen = require('../models/pen');
const multer = require('multer');
const upload = multer();
const aws = require('aws-sdk');

const s3 = new aws.S3();
const S3_BUCKET = process.env.S3_BUCKET;

router.get("/", function(req, res) {
    Pen.find({}, function(err, pens) {
        if (err){
            res.send("There was an error.");
        } else {
            res.render("index", { pens: pens, sort: "All"});
        }
    });
});

router.post('/', upload.array('image'), isLoggedIn, function(req,res, next){
    var newPen = {
        inventorynumber: req.body.inventorynumber,
        maker: req.body.maker,
        title: req.body.title,
        type: req.body.type,
        nib: req.body.nib,
        price: req.body.price,
        images: req.body.imageURLs.split(','),
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

router.put("/:id", upload.array('imageUpload'), isLoggedIn, function(req, res) {
    // Retrieve the array of images to be removed from the pen record
    let imagedeletes= [];
    if (req.body.imagechanges) {
        imagedeletes = req.body.imagechanges.split(',').map(x => parseInt(x));
    }
    // Find the pen, delete the images at their paths and splice the entries from the images array.
    Pen.findById(req.params.id, function(err, foundPen) {
        var images = [...foundPen.images];
        if (err) {
            console.log(err);
            res.redirect('/');
        } else {
            if (imagedeletes.length > 0) {
                imagedeletes.reverse().forEach(function(rmindex) { // reverse the array first, to ensure that the right indexes are spliced!
                     let awspath = images[rmindex].replace('https://rosspens-assets.s3.amazonaws.com', '');
                     if (awspath !== '') {
                        let params = {
                            Bucket: S3_BUCKET,
                            Key: awspath
                        };
                        s3.deleteObject(params, (err, data) => {
                            if (err) console.log(err);
                            else console.log(data);
                        });
                        images.splice(rmindex, 1);
                     }
                });
            }
            if (req.body.newimages) {
                req.body.newimages.split(',').forEach((imageURL) => images.push(imageURL));
                console.log(images);
            }
            var penUpdates = req.body.pen;
            penUpdates.images = [...images];
            Pen.update(foundPen, penUpdates, function(err, updatedPen){
                if (err) { console.log(err);}
                else {
                    res.redirect('/pens/' + foundPen._id);
                }
            });
        }
    });
});

router.delete("/:id", isLoggedIn, function(req, res) {
    // Locate the pen record to be deleted and delete all of the images.
    Pen.findById(req.params.id, function(err, foundPen) {
        if(err) {
            console.log(err);
        } else {
            foundPen.images.forEach(path => {
                let awspath = path.replace('https://rosspens-assets.s3.amazonaws.com', '');
                let params = {
                    Bucket: S3_BUCKET,
                    Key: awspath
                };
                if (awspath === "") {
                    return;
                } else {
                    s3.deleteObject(params, (err, data) => {
                        if (err) console.log(err);
                        else console.log(data);
                    });
                }
            });
        }
    });
    // Delete pen record
    Pen.findByIdAndRemove(req.params.id, function(err){
        if (err) {
            console.log(err);
        } else {
            res.redirect('/pens');
        }
    });
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