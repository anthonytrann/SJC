var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', { title: 'Express' });
});

router.get('/homepage', function (req, res) {
  res.render('homepage');
});

router.get('/addCandidate')


module.exports = router;
