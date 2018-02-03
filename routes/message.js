const       express     =   require('express'),
            mongoose    =   require('mongoose'),
            Message     =   require('../models/message'),
            isLoggedIn  =   require('../helpers/isLoggedIn'),
            router      =   express.Router();
            
router.get('/', isLoggedIn, (req, res) => {
    res.render('admin/newmessage');
});

router.post('/', isLoggedIn, (req,res) => {
    req.body.message.content = req.sanitize(req.body.message.content);
    Message.create(req.body.message, (err) => {
        if (err) {
            res.send("Something went wrong. Please try your request again. If the problem persists, contact the system administrator.");
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;