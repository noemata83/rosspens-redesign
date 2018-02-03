const       express     =   require('express'),
            mongoose    =   require('mongoose'),
            Message     =   require('../models/message'),
            isLoggedIn  =   require('../helpers/isLoggedIn'),
            router      =   express.Router();
            
router.get('/', isLoggedIn, (req, res) => {
    Message.findOne({}, {}, { sort: { 'dateAdded' : -1 } }, function(err, message) {
        res.render('admin/newmessage', { message: message });
    });
});

router.put('/', isLoggedIn, (req,res) => {
    req.body.message.content = req.sanitize(req.body.message.content);
    const id = req.body.message.id;
    console.log(id);
    Message.findByIdAndUpdate(id, req.body.message, (err) => {
        if (err) {
            res.send("Something went wrong. Please try your request again. If the problem persists, contact the system administrator.");
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;