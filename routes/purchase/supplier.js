var express = require('express');
var router = express.Router();
var mydb = require('../../mydb');
var appconfig = require('../../config');

module.exports.create=function(mode,req, res, next){
    res.redirect(appconfig.home+'/todo?path='+req.originalUrl);
}
module.exports.update=function(mode,req, res, next){
    res.redirect(appconfig.home+'/todo?path='+req.originalUrl);
}
module.exports.submit=function(mode,req, res, next){
    res.redirect(appconfig.home+'/todo?path='+req.originalUrl);
}
module.exports.review=function(mode,req, res, next){
    res.redirect(appconfig.home+'/todo?path='+req.originalUrl);
}
module.exports.approve=function(mode,req, res, next){
    res.redirect(appconfig.home+'/todo?path='+req.originalUrl);
}
module.exports.reject=function(mode,req, res, next){
    res.redirect(appconfig.home+'/todo?path='+req.originalUrl);
}
module.exports.publish=function(mode,req, res, next){
    res.redirect(appconfig.home+'/todo?path='+req.originalUrl);
}
module.exports.confirm=function(mode,req, res, next){
    var id=appconfig.getFieldValue(req.query.id);
    if(!id){
        res.redirect(appconfig.home+'/purchase/query');
    }
    if(mode=='post')
        doConfirm(id,req, res, next);
    else
        res.redirect(appconfig.home+'/purchase/query?id='+id);        
}
module.exports.close=function(mode,req, res, next){
    res.redirect(appconfig.home+'/todo?path='+req.originalUrl);
}
module.exports.query=function(mode,req, res, next){
    //console.log('supplier query');
    doQuery(req, res, next);
}
function doQuery(req, res, next){
        var status=appconfig.getFieldValue(req.query.status);
        var id=appconfig.getFieldValue(req.query.id);
        var resp=appconfig.getFieldValue(req.session.resp);
        if(!resp) resp='';
        req.session.resp=null;
        if(status){
            switch(status){
                case appconfig.getPurchaseStatusCode('Published'):
                    if(id){
                        mydb.query('SELECT * from `purchase_detail` where `status`=? and `purchase_no`=?',[status,id],function(err, rows, fields){
                            if(err) console.log(err.message);
                            appconfig.render(res,'supplier/purchase_detail','purchase detail',{heading:'Purchase detail',rows:rows,status:status,resp:resp});            
                        });                                           
                    }else{
                        mydb.query('SELECT * from `purchase_detail` where `status`=?',[status],function(err, rows, fields){
                            if(err) console.log(err.message);
                            appconfig.render(res,'list','purchase list',{heading:appconfig.getPurchaseStatus(status)+' Purchase List',rows:rows,status:status});            
                        });                       
                    }
                    break;
                case appconfig.getPurchaseStatusCode('Confirmed'):
                case appconfig.getPurchaseStatusCode('Completed'):
                case appconfig.getPurchaseStatusCode('Cancel'):
                    if(id){
                        mydb.query('SELECT * from `purchase_detail` where `status`=? and `vendor`=? and `purchase_no`=?',[status,req.session.user.username,id],function(err, rows, fields){
                            if(err) console.log(err.message);
                            appconfig.render(res,'supplier/purchase_detail','purchase detail',{heading:'Purchase detail',rows:rows,status:status,resp:resp});            
                        });                       
                    }else{
                        mydb.query('SELECT * from `purchase_detail` where `status`=? and `vendor`=?',[status,req.session.user.username],function(err, rows, fields){
                            if(err) console.log(err.message);
                            appconfig.render(res,'list','purchase list',{heading:appconfig.getPurchaseStatus(status)+' Purchase List',rows:rows,status:status});            
                        });   
                    }
                    break;
                default:
                    res.redirect(appconfig.home+'/user/unauth?path='+req.originalUrl);
            }
        }else{
            if(id){
                mydb.query('SELECT * from `purchase_detail` where `purchase_no`=? and (`status`=? or ((`status`=? or `status`=?) and `vendor`=?))',[
                    id,
                    appconfig.getPurchaseStatusCode('Published'),
                    appconfig.getPurchaseStatusCode('Confirmed'),
                    appconfig.getPurchaseStatusCode('Completed'),
                    req.session.user.username],function(err, rows, fields){
                    if(err) console.log(err.message);
                    appconfig.render(res,'supplier/purchase_detail','purchase detail',{heading:'Purchase Detail',rows:rows,status:status,resp:resp});            
                });                                           
            }else{
                mydb.query('SELECT * from `purchase_detail` where `status`=? or ((`status`=? or `status`=?) and `vendor`=?)',[
                    appconfig.getPurchaseStatusCode('Published'),
                    appconfig.getPurchaseStatusCode('Confirmed'),
                    appconfig.getPurchaseStatusCode('Completed'),
                    req.session.user.username],function(err, rows, fields){
                    if(err) console.log(err.message);
                    appconfig.render(res,'list','purchase list',{heading:'Purchase List',rows:rows,status:status});            
                });                                           
            }            
        }
}
function doConfirm(id,req, res, next){
    mydb.query('update `purchase_detail` set `status`=?, `vendor`=?, `vendor_accept_date`=now() where `purchase_no`=? and `status`=?',
    [appconfig.getPurchaseStatusCode('Confirmed'),req.session.user.username,id,appconfig.getPurchaseStatusCode('Published')],function(uerr,ures){
        if(uerr){
            console.log(uerr.message);
        }else{
            //console.log(ures);
            if(ures.changedRows==0) req.session.resp='Confirm Failed!';
        }
        res.redirect(appconfig.home+'/purchase/query?id='+id);        
    });
}