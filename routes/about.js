const express = require('express'),
      passport = require('passport'),
      Article = require('../models/article'),
      router = express.Router(),
      getTitles = require('../helpers/getTitles'),
      isLoggedIn = require('../helpers/isLoggedIn'),
      Figure = require('../models/figure');
const multer = require('multer');
const upload = multer();
      
router.get('/', isLoggedIn, (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) {
            res.send("Something went wrong. Please try your request again. If the problem persists, contact the system administrator.");
        } else {
            res.render("about/index", { articles: articles});
        }
    });
});

router.get('/new', isLoggedIn, (req, res) => {
    res.render("about/new");
});

router.post('/', isLoggedIn, (req, res) => {
    req.body.article.content = req.sanitize(req.body.article.content); // Good use case for Middleware
    Article.create(req.body.article, (err, article) => {
        if (err) {
            res.send("Something went wrong: ", err);
        } else {
            getTitles().then( titles => {
                global.articleTitles = [...titles];
            });
            res.redirect('/about');
        }
    });
});

router.get('/images', isLoggedIn, (req,res) => {
    Figure.find({}, (err, images) => {
        if (err) {
            res.send("Something went wrong: ", err);
        } else {
            res.json(images);
        }
    });
});

router.post('/images', upload.array('image'), isLoggedIn, (req, res) => {
    Figure.create({ URL: req.body.imageURLs}, (err) => {
                if(err) {
                    res.send("Something went wrong: ", err);
                } else {
                    res.redirect('/about/new');
                }
            });
    });

    // Figure.create(req.body.image, (err, image) => {
    //     if (err) {
    //         res.send("Something went wrong: ", err);
    //     } else {
    //         res.end();
    //     }
    // });

router.get('/:title', (req, res) => {
    const title = decodeURI(req.params.title);
    Article.findOne({title: title}, (err, article) => {
        if (err) {
            res.send("Something went wrong. Please try your request again. If the problem persists, contact the system administrator.");
        } else {
            if (!article) {
                res.redirect('/404');
            } else {
                res.render("about/article", { article: article });
            }
        }
    });
});

router.get('/:title/edit', isLoggedIn, (req, res) => {
     const title = decodeURI(req.params.title);
     Article.findOne({ title: title}, (err, article) => {
         if (err) {
             res.send("Something went wrong: ", err);
         } else {
             res.render("about/edit", {article: article})
         }
     })
});

router.put('/:title', isLoggedIn, (req, res) => {
    const title = decodeURI(req.params.title);
    Article.findOneAndUpdate({ title: title}, req.body.article, (err, updatedArticle) => {
        if (err) {
             res.send("Something went wrong: ", err);
        } else {
            getTitles().then( titles => {
                global.articleTitles = [...titles];
            });
            res.redirect('/about/' + encodeURI(req.body.article.title));
        }
    });
});

router.delete('/:title', isLoggedIn, (req, res) => {
    const title = decodeURI(req.params.title);
    Article.findOneAndRemove({ title: title }, (err) => {
        if (err) {
            res.send("Something went wrong: ", err);
        } else {
            getTitles().then( titles => {
                global.articleTitles = [...titles];
            });
            res.redirect('/');
        }
    });
});

module.exports = router;