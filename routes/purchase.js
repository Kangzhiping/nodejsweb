var express = require('express');
var router = express.Router();
var mydb = require('../mydb');
var appconfig = require('../config');
var buyer=require('./purchase/buyer');
var supplier=require('./purchase/supplier');
var manager=require('./purchase/manager');
var admin=require('./purchase/administrator');
var idadmin=require('./purchase/idadmin');

function getUserModule(req,res,next){
    if(appconfig.isBuyer(req.session.user.groupid)){
        return buyer;
    }else if(appconfig.isManager(req.session.user.groupid)){
        return manager;
    }else if(appconfig.isSupplier(req.session.user.groupid)){
        return supplier;
    }else if(appconfig.isIdAdmin(req.session.user.groupid)){
        return idadmin;
    }else if(appconfig.isAdministrator(req.session.user.groupid)){
        return admin;
    }else{
        return null;
    }
}

router.get('/:action',function(req,res,next){
    purchase('get',req,res,next);
});
router.post('/:action',function(req,res,next){
    purchase('post',req,res,next);
});
function purchase(mode,req,res,next){
    if(typeof(req.params.action)=='undefined'||!req.params.action){
        next();//if no action provided
    }
    var action=getUserModule(req,res);    
    if(!action){//if no module found
        console.log('purchase module not found');
        next();
    }
    switch(req.params.action){
        case 'create':
            tryInvoke(action.create,mode,req, res, next);
            break;
        case 'update':
            tryInvoke(action.update,mode,req, res, next); 
            break;    
        case 'cancel':
            tryInvoke(action.cancel,mode,req, res, next); 
            break;   
        case 'recall':
            tryInvoke(action.recall,mode,req, res, next); 
            break;   
        case 'submit':
            tryInvoke(action.submit,mode,req, res, next); 
            break;
        case 'review':
            tryInvoke(action.review,mode,req, res, next); 
            break;
        case 'approve':
            tryInvoke(action.approve,mode,req, res, next); 
            break;
        case 'reject':
            tryInvoke(action.reject,mode,req, res, next); 
            break;
        case 'complete':
            tryInvoke(action.complete,mode,req, res, next); 
            break;
        case 'publish':
            tryInvoke(action.publish,mode,req, res, next); 
            break;
        case 'confirm':
            tryInvoke(action.confirm,mode,req, res, next); 
            break;
        case 'close':
            tryInvoke(action.close,mode,req, res, next); 
            break;
        case 'query':
            tryInvoke(action.query,mode,req, res, next);
            break;
        case 'changestatus':
            tryInvoke(action.changestatus,mode,req, res, next);
            break;
        default:
            next();//if action not defined
    }
}
function tryInvoke(method,mode,req, res, next){
    if(typeof(method)=='undefined'||method==null){
        res.redirect(appconfig.home+'/todo?path='+req.originalUrl);                
    }else{
        method(mode,req, res, next);
    } 
}
module.exports = router;