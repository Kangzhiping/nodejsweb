var express = require('express');
var router = express.Router();
var appconfig = require('../config');
var rpc = require('../jsonrpc');
var msg = require('../message');
var user = require('./api/user');

router.get('/', function (req, res, next) {
    if(!rpc.isRequest(req.body)){
        rpc.senddanger(req,res,"Invalid jsonrpc request.");
        return;        
    }
    rpc.sendsuccess(req,res,"Nothing to do");
});

router.get('/user', function (req, res, next) {
    if(!rpc.isRequest(req.body)){
        rpc.senddanger(req,res,"Invalid jsonrpc request.");
        return;        
    }
    var jsonreq=req.body;
    switch(jsonreq.method){
        case "login"://get login status
            if(user.checkLogin(req))
                rpc.sendsuccess(req,res,"Already login!");
            else
                rpc.senddanger(req,res,"Pls. login!");
            break;
        case "logout"://logout
            if (user.checkLogin(req)){
                rpc.sendsuccess(req,res,"already logout!");
                return;        
            }
            user.doLogout(req, res, next,apionreturn);
            break;
        default:
            if (user.checkLogin(req)){
                rpc.senddanger(req,res,"Pls. login!");
                return;        
            }
           rpc.senddanger(req,res,"Method "+jsonreq.method+" not implemented!");
    }
});
router.post('/user', function (req, res, next) {
    jsonreq=req.body;
    jsonreq.params=JSON.parse(req.body.params);
    req.body=jsonreq;

    if(!rpc.isRequest(jsonreq)){
        rpc.senddanger(req,res,"Invalid jsonrpc request.");
        return;        
    }
    switch(jsonreq.method){
        case "login"://get login status
            user.doLogin(req, res, next,apionreturn);
            break;
        case "register"://logout
            user.doRegister(req, res, next,apionreturn);
            break;
        default:
            if (user.checkLogin(req)){
                rpc.senddanger(req,res,"Pls. login!");
                return;        
            }
            rpc.senddanger(req,res,"Method "+jsonreq.method+" not implemented!");
    }
});
function apionreturn(req,res,rpcresult){
    res.send(rpcresult);
}
module.exports = router;