const Pen = require("../models/pen")
const Maker = require("../models/maker")
const slugify = require("slugify")
const aws = require("aws-sdk")
const sortMakers = require("../helpers/sortMakers")
const subWeeks = require("date-fns/subWeeks")

const s3 = new aws.S3()
const S3_BUCKET = process.env.S3_BUCKET

const DEFAULT_BANNER =
  "https://rosspens-assets.s3.amazonaws.com/images/default_header.png"

const newPen = async (req, res) => {
  const makers = await Maker.find({})
  res.render("new", { makers: sortMakers(makers) })
}

const createPen = async (req, res) => {
  try {
    const maker = await Maker.findOne({ slug: req.body.maker })
    const penToCreate = {
      inventoryNumber: req.body.inventoryNumber,
      title: req.body.title,
      slug: slugify(req.body.title).toLowerCase(),
      maker: maker._id,
      description: req.body.description,
      type: req.body.type,
      nib: req.body.nib,
      price: req.body.price,
      images: req.body.imageURLs.split(","),
    }
    const newPen = await Pen.create(penToCreate)
    res.redirect(`/pens/${maker.slug}/${newPen.type}`)
  } catch (err) {
    res.send(`There was an error: ${err}`)
  }
}

const findPenByMakerAndType = async (req, res) => {
  try {
    const maker = await Maker.findOne({ slug: req.params.maker })
    const pens = await Pen.find({
      maker: maker._id,
      type: req.params.type,
      sold: false,
    }).sort("-dateAdded")
    res.render("index", { pens, sort: maker.name, banner: maker.bannerImage })
  } catch (err) {
    console.log(err)
    res.render("index", { pens: [] })
  }
}

const listPens = async (req, res) => {
  try {
    const pens = await Pen.find({ sold: false }).sort("-dateAdded")
    res.render("index", { pens: pens, sort: "All", banner: DEFAULT_BANNER })
  } catch (err) {
    res.send(`There was an error: ${err}`)
  }
}

const listNewPens = async (req, res) => {
  try {
    let today = new Date()
    let startDate = subWeeks(today, 6)
    let newPens = await Pen.find({
      sold: false,
      dateAdded: { $gte: startDate },
    })
    if (newPens.length < 12) {
      newPens = await Pen.find({ sold: false })
        .limit(12)
        .sort("-dateAdded")
        .exec()
    }
    res.render("index", { pens: newPens, sort: "New", banner: DEFAULT_BANNER })
  } catch (err) {
    console.log(err)
  }
}

const listPensOfType = async (req, res) => {
  try {
    const pens = await Pen.find({ type: req.params.type, sold: false }).sort(
      "-dateAdded"
    )
    res.render("index", {
      pens: pens,
      sort: req.params.type,
      banner: DEFAULT_BANNER,
    })
  } catch (err) {
    res.redirect("/404")
  }
}

const fetchOnePen = async (req, res) => {
  try {
    const foundPen = await Pen.findOne({ slug: req.params.slug })
    if (!foundPen) {
      res.redirect("/404")
    } else {
      res.render("show", { pen: foundPen })
    }
  } catch (err) {
    res.redirect("/")
  }
}

const editPen = async (req, res) => {
  try {
    const foundPen = await Pen.findOne({ slug: req.params.slug })
      .populate("maker")
      .exec()
    const makers = await Maker.find({})
    res.render("edit", { pen: foundPen, makers: sortMakers(makers) })
  } catch (err) {
    console.log(err)
    res.redirect("/")
  }
}

const updatePen = async (req, res) => {
  // Retrieve the array of images to be removed from the pen record
  let imagedeletes = []
  if (req.body.imagechanges) {
    imagedeletes = req.body.imagechanges.split(",").map((x) => parseInt(x))
  }
  // Find the pen, delete the images at their paths and splice the entries from the images array.
  try {
    const foundPen = await Pen.findOne({ slug: req.params.slug })
    var images = [...foundPen.images]
    if (imagedeletes.length > 0) {
      imagedeletes.reverse().forEach(function (rmindex) {
        // reverse the array first, to ensure that the right indexes are spliced!
        let awspath = images[rmindex].replace(
          "https://rosspens-assets.s3.amazonaws.com",
          ""
        )
        if (awspath !== "") {
          let params = {
            Bucket: S3_BUCKET,
            Key: awspath,
          }
          s3.deleteObject(params, (err, data) => {
            if (err) console.log(err)
            else console.log(data)
          })
          images.splice(rmindex, 1)
        }
      })
    }
    if (req.body.newimages) {
      req.body.newimages.split(",").forEach((imageURL) => images.push(imageURL))
    }
    const penUpdates = req.body.pen
    const maker = await Maker.findOne({ slug: req.body.pen.maker })
    penUpdates.images = [...images]
    penUpdates.maker = maker._id
    await Pen.update(foundPen, penUpdates, { new: true })
    res.redirect("/pens/" + foundPen.slug)
  } catch (err) {
    console.log(err)
    res.redirect("/admin/pens")
  }
}

const markPenAsSold = async (req, res) => {
  const foundPen = await Pen.findOne({ slug: req.params.slug })
  foundPen.sold = true
  foundPen.save()
  res.redirect("back")
}

const reactivatePen = async (req, res) => {
  const foundPen = await Pen.findOne({ slug: req.params.slug })
  foundPen.sold = false
  foundPen.save()
  res.redirect("back")
}

const deletePen = async (req, res) => {
  Pen.findOne({ slug: req.params.slug }, function (err, foundPen) {
    if (err) {
      console.log(err)
    } else {
      foundPen.images.forEach((path) => {
        let awspath = path.replace(
          "https://rosspens-assets.s3.amazonaws.com",
          ""
        )
        let params = {
          Bucket: S3_BUCKET,
          Key: awspath,
        }
        if (awspath === "") {
          return
        } else {
          s3.deleteObject(params, (err, data) => {
            if (err) console.log(err)
            else console.log(data)
          })
        }
      })
    }
  })
  // Delete pen record
  Pen.findOneAndRemove({ slug: req.params.slug }, function (err) {
    if (err) {
      console.log(err)
    } else {
      res.redirect("/pens")
    }
  })
}

module.exports = {
  newPen,
  listPens,
  listNewPens,
  createPen,
  editPen,
  updatePen,
  fetchOnePen,
  findPenByMakerAndType,
  listPensOfType,
  markPenAsSold,
  reactivatePen,
  deletePen,
}
