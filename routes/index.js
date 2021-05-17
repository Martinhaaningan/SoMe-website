// fra modelløsning A.s71
var express = require('express');
var router = express.Router();
const auth = require("../controllers/authController.js");
const yaddaController = require('../controllers/yaddaController.js');
const userController = require('../controllers/userController.js');
const { ensureAuthenticated } = require('../config/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
    let user = req.user ? req.user.uid : null; // ? er if for det foran ?
    res.render('index', {
        title: 'Frontpage',
        user: user
    });
});
// Feed/
router.get('/feed', ensureAuthenticated, async function(req, res, next) { //ensureAuthenticated sikrer, at man er logged ind
    let user = req.user ? req.user.uid: null; // ? er if for det foran ?
    let uid = req.user.uid;
    let users = await userController.getUsers(req, res);
    let follows = await userController.getFollows(req, res);
    let yaddas = await yaddaController.getYaddas(req, res);
    let yaddareplies = await yaddaController.getReplies(req, yaddas);
    res.render('feed', {
        title: 'The feed',
        user: user,
        users,
        follows,
        yaddas,
        yaddareplies
    });    
});

// get yaddaform - hvor man som bruger indtaster selv i formular, hvem der skal sendes til
router.get('/yaddaForm/', ensureAuthenticated, async function(req, res) {
    let users = await userController.getUsers(req, res);
    let user = req.user ? req.user.uid: null;
    let yadda = "";
    res.render('yaddaForm', {
        yadda,
        users,
        title: 'New post',
        user: user
    });
});

// get yaddaform til replies
router.get('/yaddaForm/:yadda', ensureAuthenticated, async function(req, res) {
    let user = req.user ? req.user.uid: null;
    let yadda = req.params.yadda;
    res.render('yaddaForm', {
        title: 'Reply to a yadda',
        user: user,
        yadda
    });
})

// get yaddaform med uid fra 
router.get('/yaddaForm/:uid', ensureAuthenticated, async function(req, res) {
    let user = req.user ? req.user.uid: null;
    let users = await userController.getUsers(req, res);
    let uid = req.params.uid;
    let friend = await yaddaController.gotoYaddaform(req, res); // friend fordi at vi snakker om en vi sender besked til. SÅ derfor ikke follow
    res.render('yaddaForm', {
        users,
        friend,
        title: 'yadda to ' + friend.name, // måske friend hvis user ikke virker
        user: user
    });
});

// post yaddaform
router.post('/yaddaForm', getWithHashtag, ensureAuthenticated, async function(req, res) {
    let yaddareply = "";
    await yaddaController.postYadda(req, res);
});

//Reply
//links er get request
router.get('/replyto/:yadda', ensureAuthenticated, async function(req, res) {
    let user = req.user ? req.user.uid: null;
    let yadda = req.params.yadda;
    //let yaddareplies = await yaddaController.replyTo(req, res);
    res.redirect('/yaddaForm/' + yadda);
});



// post yaddas som en reply
router.post('/yaddaForm/:yadda', getWithHashtag, ensureAuthenticated, async function(req, res) {
    let yadda = req.params.yadda;
    await yaddaController.postYadda(req, res);
    });

//Dark/Light dashboard mode 
router.get('/dashboard', ensureAuthenticated, async function(req, res) {
    res.render('dashboard');
});

module.exports = router;