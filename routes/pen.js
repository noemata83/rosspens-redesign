const express = require("express")
const router = express.Router()
const Pen = require("../models/pen")
const multer = require("multer")
const upload = multer()
const aws = require("aws-sdk")
const isLoggedIn = require("../helpers/isLoggedIn")
const {
  newPen,
  createPen,
  listNewPens,
  listPens,
  listPensOfType,
  fetchOnePen,
  editPen,
  updatePen,
  markPenAsSold,
  reactivatePen,
  deletePen,
  findPenByMakerAndType,
} = require("../controllers/pen")

const s3 = new aws.S3()
const S3_BUCKET = process.env.S3_BUCKET

router.get("/", listPens)

router.post("/", upload.array("image"), isLoggedIn, createPen)

router.get("/new", isLoggedIn, newPen)

router.get("/whatsnew", listNewPens)

router.get("/type/:type", listPensOfType)

router.get("/:slug", fetchOnePen)

// router.get("/:id", function(req, res) {
//     Pen.findById(req.params.id, function(err, foundPen) {
//       if (err) {
//           res.redirect("/");
//       } else {
//           res.render("show", { pen : foundPen});
//       }
//     });
// });

router.get("/:slug/edit", isLoggedIn, editPen)

router.put("/:slug", upload.array("imageUpload"), isLoggedIn, updatePen)

router.put("/:slug/sold", isLoggedIn, markPenAsSold)

router.put("/:slug/activate", isLoggedIn, reactivatePen)

router.delete("/:slug", isLoggedIn, deletePen)

/*

function(req, res) {
    // Locate the pen record to be deleted and delete all of the images.
    Pen.findOne({slug: req.params.slug}, function(err, foundPen) {
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
    Pen.findOneAndRemove({ slug: req.params.slug}, function(err){
        if (err) {
            console.log(err);
        } else {
            res.redirect('/pens');
        }
    });
} */

router.get("/:maker/:type", findPenByMakerAndType)

module.exports = router
