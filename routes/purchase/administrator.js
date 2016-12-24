var express = require('express');
var router = express.Router();
var mydb = require('../../mydb');
var appconfig = require('../../config');

module.exports.create=function(mode,req, res, next){
    res.redirect(appconfig.home+'/todo?path='+req.originalUrl);
}
module.exports.update=function(mode,req, res, next){
    if(mode=='get'){
        var id=appconfig.getFieldValue(req.query.id);
        if(id){
            mydb.query('SELECT * from `purchase_detail` where `purchase_no`=?',[id],function(err, rows, fields){
                req.session.oldrows=rows;
                req.session.backUrl=req.header('Referer');
                appconfig.render(res,'admin/purchase_detail_update','Update purchase',{
                    rows:rows,
                    heading: rows.length==0?'purchase not found':'Update purchase detail'
                });            
            });   
        }else{
            res.redirect(appconfig.home+'/purchase/query?id='+id);
        }
    }else{
        //res.redirect(appconfig.home+'/todo?path='+req.originalUrl);
        doUpdate(req, res, next);
    }
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
    res.redirect(appconfig.home+'/todo?path='+req.originalUrl);
}
module.exports.close=function(mode,req, res, next){
    res.redirect(appconfig.home+'/todo?path='+req.originalUrl);
}
module.exports.query=function(mode,req, res, next){
    if(mode=='get'){
        doQuery(req, res, next);
    }else{        
        doQuery(req, res, next);
    }
}
module.exports.changestatus=function(mode,req, res, next){
    var status=appconfig.getFieldValue(req.query.status);
    var id=appconfig.getFieldValue(req.query.id);
    if(!status||!id){
        res.redirect(appconfig.home+'/purchase/query');
        return;
    }
    if(mode=='get'){
        res.redirect(appconfig.home+'/purchase/query?id='+id);
    }else{        
        doChangeStatus(id,status,req, res, next);
    }
}
function doQuery(req, res, next){
    var status=appconfig.getFieldValue(req.query.status);
    var id=appconfig.getFieldValue(req.query.id);
    if(status==null&&id==null){
        mydb.query('SELECT * from `purchase_detail`',[],function(err, rows, fields){
            appconfig.render(res,'list','purchase list',{rows:rows,heading:'All Purchases',status:status});            
        });   
    }else if(status==null){
        mydb.query('SELECT * from `purchase_detail` where `purchase_no`=?',[id],function(err, rows, fields){
            appconfig.render(res,'admin/purchase_detail','purchase detail',{
                rows:rows,
                heading:rows.length==0?'purchase '+id+' not found':'Purchase Detail'
            });            
        });   
    }else if(id==null){
        mydb.query('SELECT * from `purchase_detail` where `status`=?',[status],function(err, rows, fields){
            appconfig.render(res,'list','purchase list',{rows:rows,heading: appconfig.getPurchaseStatus(status)+' Purchases',status:status});            
        });   
    }else{
        mydb.query('SELECT * from `purchase_detail` where `purchase_no`=? and `status`=?',[id,status],function(err, rows, fields){
            appconfig.render(res,'admin/purchase_detail','purchase detail',{
                rows:rows,
                heading:rows.length==0?'purchase '+id+' not found':'Purchases Detail'
            });            
        });
    }
}
function doChangeStatus(id,status,req, res, next){
    mydb.query('select * from `purchase_detail` where `purchase_no`=? for update',[id],function(err, rows, fields){
        if(!err){
            if(rows.length){
                mydb.query('update `purchase_detail` set `status`=? where `purchase_no`=?',[status,id],function(uerr,ures){
                    if(err){
                        console.log(err.message);
                    }
                    res.redirect(appconfig.home+'/purchase/query?id='+id);        
                });
            }else{
                res.redirect(appconfig.home+'/purchase/query?id='+id);
            }
        }else{
            console.log(err.message);
            res.redirect(appconfig.home+'/purchase/query?id='+id);
        }
    });
}
function doUpdate(req, res, next){
    var id=appconfig.getFieldValue(req.query.id);
    if(!id||id!=req.session.oldrows[0].purchase_no){
        res.redirect(appconfig.home+'/purchase/query');
        return;
    }
    //todo: valid the input
    var data=fmtQueryData(req.session.oldrows[0]);
    var rows=req.session.oldrows;
    req.session.oldrows=null;
    for(var f in rows[0]){
        if(req.body[f]=='null'){
            rows[0][f]=null;
        }else{
            rows[0][f]=req.body[f];
        }
    }
    var ustmt=fmtUpdateStmt(rows[0],data.where,data.value);
    mydb.query(ustmt.str,ustmt.value,function(uerr,ures){
        if(uerr){
            console.log(uerr.message);
        }else{
            //console.log(ures);
            if(ures.changedRows) 
                id=rows[0].purchase_no;
        }
        //res.redirect(appconfig.home+'/purchase/query?id='+id);
        backUrl=req.session.backUrl;
        req.session.backUrl=null;
        res.redirect(backUrl);        
    });
}
function fmtQueryData(row){
    var data={
        select:'select * from `purchase_detail` ',
        where:' where ',
        other:' for update',
        value:new Array()
    };
    var i=0;
    for(var k in row){
        if(row[k]!=null){
            data.where = data.where +'`' +k+'`' + '=? and ';
            data.value[i]=row[k];
            i++;
        }
    }
    data.where=data.where.substr(0,data.where.length-5);
    //console.log(data);
    return data;
}
function fmtUpdateStmt(row,where,whereval){
    var data={
        str:'update `purchase_detail` set ',
        value:new Array()
    };
    var i=0;
    for(var k in row){
        data.str =data.str+ '`'+k+'`=?,';
        data.value[i]=row[k];
        i++;
    }
    data.str=data.str.substr(0,data.str.length-1);
    data.str=data.str+' '+where;
    for(var k in whereval){
        data.value[i]=whereval[k];
        i++;
    }
    //console.log(data);
    return data;
}