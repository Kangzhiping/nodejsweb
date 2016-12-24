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
    if(mode=='get') 
    	approve(req, res, next);
    else{
    	approve(req, res, next);    	
    }
}
module.exports.reject=function(mode,req, res, next){
    if(mode=='get') 
    	reject(req, res, next);
    else{
    	reject(req, res, next);    	
    }
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
	
    if(mode=='get') 
    	query(req, res, next);
    else{
    	query(req, res, next);    	
    }
}

function query(req, res, next) {
	var status=appconfig.getFieldValue(req.query.status);
	if(status){
		switch(status){
			case appconfig.getPurchaseStatusCode('Submitted'):
			//show pending approval purchase list
				mydb.query('SELECT * FROM purchase_detail WHERE `status`=?', [status], function (err, rows, fields) {
					if (err) {
						console.error(err.message);
					}
					//appconfig.render(res,'approvelist','approve list',{
					//	rows:rows,heading:'Pending Approval Purchases',manageraction:'1'
					//});
					appconfig.render(res,'approvelist','approve list', {rows:rows,heading:'Pending Approval Purchases',manageraction:'1'});
				});
				break;
			case appconfig.getPurchaseStatusCode('Approved'):
			//show approved purchase list
				mydb.query('SELECT * FROM purchase_detail WHERE approval_person=?', [req.session.user.username], function (err, rows, fields) {
					if (err) {
						console.error(err.message);
					}else{
					}
					appconfig.render(res,'approvelist','approve list',{
					rows:rows,heading:'Approved Purchases',manageraction:'2'
					});
				});	
				break;	
			default:
				res.redirect(appconfig.home+'/');
		}
	}else{
		mydb.query('SELECT * FROM purchase_detail WHERE `status`=1 or status = 4 or status = 5 or status = 6 or (status =3 and approval_person=?)', [req.session.user.username], function(err, rows, fields) {
		    if (err) {
		      console.error(err.message);
		    }else{
			}		
			appconfig.render(res,'approvelist','approve list',{
			rows:rows,heading:'All Purchases',manageraction:'2'
		});
		});
	}
}


function approve(req, res, next){
	// manager approve the purchase 
	var id=appconfig.getFieldValue(req.query.id);
	  mydb.query('update purchase_detail SET status='+appconfig.getPurchaseStatusCode('Approved')+',approval_person=?,approval_date=now() where purchase_no = ? and status='+appconfig.getPurchaseStatusCode('Submitted'), [req.session.user.username,id], function (err, result) {
		    if (err) {
		      console.error(err.message);
		    }else{
		    }
		    res.redirect(appconfig.home+'/purchase/query?status=1');
	  });
	
}

function reject(req, res, next){
	// manager reject the purchase 
	var id=appconfig.getFieldValue(req.query.id);
	  mydb.query('update purchase_detail SET status=0 where purchase_no = ?', [id], function (err, result) {
		    if (err) {
		      console.error(err.message);
		    }else{
		    }
		    res.redirect(appconfig.home+'/purchase/query?status=1');
		    });
	
}