var express = require('express');
var router = express.Router();
var appconfig = require('../config');

/* GET home page. */
router.get('/', function(req, res, next) {
  appconfig.render(res,'index','Cocos Home');
});
router.get('/todo', function(req, res, next) {
  appconfig.render(res,'todo','Todo',{path:req.query.path,group:appconfig.getUserGroup(req.session.user.groupid)});
});
module.exports = router;
