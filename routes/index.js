var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/samples', function(req, res, next) {
  res.render('samples');
});

module.exports = router;
