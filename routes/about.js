const express = require('express'),
      router = express.Router();
      
router.get('/', (req, res) => {
    res.render("about/index");
});

router.get('/tpc', (req, res) => {
    res.render("about/tpc");
});

router.get('/moore', (req, res) => {
    res.render('about/moore');
});
      
module.exports = router;