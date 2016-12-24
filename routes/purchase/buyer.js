var express = require('express');
var router = express.Router();
var mydb = require('../../mydb');
var appconfig = require('../../config');

module.exports.create = function(mode, req, res, next) {
	if (mode == 'get') {
		appconfig.render(res, 'new_request', 'new request');
	} else if (mode == 'post') {
		var insertSQL = 'insert into purchase_detail (product_no,product_desc,purchase_quantity,status,purchase_price,create_person,create_date) values ';
		var execSQL = false;
		for (var i = 0; i < 5; i++) {
			if (req.body.product_no[i] != '' && req.body.product_desc[i] != ''
					&& req.body.purchase_quantity[i] != ''
					&& req.body.purchase_price[i] != '') {
				if (!execSQL) {
					insertSQL = insertSQL + '(';
				} else {
					insertSQL = insertSQL + ', (';
				}
				insertSQL = insertSQL + '"' + req.body.product_no[i] + '"'
						+ ',' + '"' + req.body.product_desc[i] + '"' + ','
						+ req.body.purchase_quantity[i] + ',' + '0' + ','
						+ req.body.purchase_price[i] + ',' + "'"
						+ req.session.user.username + "'" + ',' + 'NOW())';
				execSQL = true;
			}
		}
		if (execSQL) {
			console.log(insertSQL);
			mydb.query(insertSQL, function(error, result) {
				if (error) {
					console.error(error.message);
					req.session.resp = 'failed';
				} else {
					console.log(req.body);
					req.session.resp = 'succ';
				}
				res.redirect(appconfig.home + '/purchase/query?status=0');
			});
		}
	}
}
module.exports.update = function(mode, req, res, next) {
	// action: 1 submit, 2 cancel , 3, update, 4 recall
	var action = req.query.action;
	if (action != 3) {
		next();
	}
	if (mode == 'get') {
		var querySQL = 'select purchase_no, product_no, product_desc, purchase_quantity, purchase_price from purchase_detail where purchase_no =? and create_person = ? ';
		mydb.query(querySQL,
				[ req.query.purchase_no, req.session.user.username ], function(
						error, row) {
					if (error) {
						console.error(error.message);
					} else {
						console.log(req.body);
						req.session.update_purchase_no = req.query.purchase_no;
					}
					appconfig.render(res, 'update_purchase', 'purchase update',
							{
								row : row
							});
				});
	} else if (mode == 'post') {
		if (req.session.update_purchase_no != req.query.purchase_no) {
			next();
		}
		var updateSQL = 'update purchase_detail set product_no = ?, product_desc = ?,purchase_quantity=?, purchase_price=?, update_person =?, update_date = NOW() where purchase_no =? and create_person = ? and status = 0';
		mydb.query(updateSQL, [ req.body.product_no, req.body.product_desc,
				req.body.purchase_quantity, req.body.purchase_price,
				req.session.user.username, req.query.purchase_no,
				req.session.user.username ], function(error) {
			if (error) {
				console.error(error.message);
			} else {
				console.log(req.body);
			}
			res.redirect(appconfig.home + '/purchase/query?status=0');
		});
	}
}
module.exports.submit = function(mode, req, res, next) {
	// action: 1 submit, 2 cancel , 3, update, 4 recall
	var action = req.query.action;
	if (action != 1) {
		next();
	}
	console.log('mike 01 ' + mode);
	if (mode == 'post') {
		var updateSQL = 'update purchase_detail set status = 1, update_person =?, update_date = NOW() where purchase_no =? and create_person = ? and status = 0 ';
		mydb.query(updateSQL, [ req.session.user.username,
				req.query.purchase_no, req.session.user.username ], function(
				error) {
			if (error) {
				console.error(error.message);
			} else {
				console.log(req.body);
			}
			res.redirect(appconfig.home + '/purchase/query?status=0');
		});
	} else {
		next();
	}
}
module.exports.complete = function(mode, req, res, next) {
	// action: 1 submit, 2 cancel , 3, update, 4 recall, 5 publish, 6 complete
	var action = req.query.action;
	if (action != 6) {
		next();
	}
	if (mode == 'post') {
		var updateSQL = 'update purchase_detail set status = 6, update_person =?, update_date = NOW() where purchase_no =? and create_person = ? and status =5 ';
		mydb.query(updateSQL, [ req.session.user.username,
				req.query.purchase_no, req.session.user.username ], function(
				error) {
			if (error) {
				console.error(error.message);
			} else {
				console.log(req.body);
			}
			res.redirect(appconfig.home + '/purchase/query?status=5');
		});
	} else {
		next();
	}
}
module.exports.cancel = function(mode, req, res, next) {
	// action: 1 submit, 2 cancel , 3, update, 4 recall
	var action = req.query.action;
	if (action != 2) {
		next();
	}
	if (mode == 'post') {
		var updateSQL = 'update purchase_detail set status = 7, update_person =?, update_date = NOW() where purchase_no =? and create_person = ? and status = 0';
		mydb.query(updateSQL, [ req.session.user.username,
				req.query.purchase_no, req.session.user.username ], function(
				error) {
			if (error) {
				console.error(error.message);
			} else {
				console.log(req.body);
			}
			res.redirect(appconfig.home + '/purchase/query?status=0');
		});
	} else {
		next();
	}
}
module.exports.recall = function(mode, req, res, next) {
	// action: 1 submit, 2 cancel , 3, update, 4 recall
	var action = req.query.action;
	if (action != 4) {
		next();
	}
	if (mode == 'post') {
		var updateSQL = 'update purchase_detail set status = 0, update_person =?, update_date = NOW() where purchase_no =? and create_person = ? and status = 7 ';
		mydb.query(updateSQL, [ req.session.user.username,
				req.query.purchase_no, req.session.user.username ], function(
				error) {
			if (error) {
				console.error(error.message);
			} else {
				console.log(req.body);
			}
			res.redirect(appconfig.home + '/purchase/query?status=0');
		});
	} else {
		next();
	}
}
module.exports.review = function(mode, req, res, next) {
	res.redirect(appconfig.home + '/todo?path=' + req.originalUrl);
}
module.exports.approve = function(mode, req, res, next) {
	res.redirect(appconfig.home + '/todo?path=' + req.originalUrl);
}
module.exports.reject = function(mode, req, res, next) {
	res.redirect(appconfig.home + '/todo?path=' + req.originalUrl);
}
module.exports.publish = function(mode, req, res, next) {
	// action: 1 submit, 2 cancel , 3, update, 4 recall, 5 publish
	var action = req.query.action;
	if (action != 5) {
		next();
	}
	if (mode == 'post') {
		var updateSQL = 'update purchase_detail set status = 4, update_person =?, update_date = NOW() where purchase_no =? and create_person = ? and status = 3 ';
		mydb.query(updateSQL, [ req.session.user.username,
				req.query.purchase_no, req.session.user.username ], function(
				error) {
			if (error) {
				console.error(error.message);
			} else {
				console.log(req.body);
			}
			res.redirect(appconfig.home + '/purchase/query?status=3');
		});
	} else {
		next();
	}
}
module.exports.confirm = function(mode, req, res, next) {
	res.redirect(appconfig.home + '/todo?path=' + req.originalUrl);
}
module.exports.close = function(mode, req, res, next) {
	res.redirect(appconfig.home + '/todo?path=' + req.originalUrl);
}
module.exports.query = function(mode, req, res, next) {
	var status = appconfig.getFieldValue(req.query.status);
	var username = req.session.user.username;
	var cond = false;

	var querySQL = 'select * from purchase_detail ';
	var SQLOrder = ' ORDER BY purchase_no DESC limit 20';

	if (req.query.page == -1 && req.session.firstNum != '') {
		querySQL = querySQL + ' where purchase_no > ' + req.session.firstNum;
		cond = true;
	} else if (req.query.page == 1 && req.session.nextNum != '') {
		querySQL = querySQL + ' where purchase_no < ' + req.session.nextNum;
		cond = true;
	}

	if (status == null) {
		querySQL = querySQL + SQLOrder;
		mydb.query(querySQL, function(error, rows) {
			if (error) {
				console.error(error.message);
			} else {
				console.log(req.body);
			}
			if (rows.length > 0) {
				rows = FormatRows(rows);
				req.session.firstNum = rows[0].purchase_no;
				req.session.nextNum = rows[rows.length - 1].purchase_no;
			}
			if (rows.length < 20) {
				req.session.firstNum = 0;
				req.session.nextNum = 999999999;
			}
			appconfig.render(res, 'purchase_all', 'All purchase', {
				rows : rows,
				status : status,
				header : 'All purchase'
			});
		});
	} else {
		if (cond) {
			querySQL = querySQL + ' and status = ? and create_person = ?'
					+ SQLOrder;
		} else {
			querySQL = querySQL + ' where status = ? and create_person = ?'
					+ SQLOrder;
		}
		mydb.query(querySQL, [ status, username ], function(error, rows) {
			if (error) {
				console.error(error.message);
			} else {
				console.log(req.body);
			}
			if (rows.length > 0) {
				rows = FormatRows(rows);
				req.session.firstNum = rows[0].purchase_no;
				req.session.nextNum = rows[rows.length - 1].purchase_no;
			}
			if (rows.length < 20) {
				req.session.firstNum = 0;
				req.session.nextNum = 999999999;
			}
			appconfig.render(res, 'purchase_all', appconfig
					.getPurchaseStatus(status)
					+ ' purchase', {
				rows : rows,
				status : status,
				header : 'Purchase with status '
						+ appconfig.getPurchaseStatus(status)
			});
		});
	}
}

function FormatRows(rows) {
	for ( var i in rows) {
		rows[i].status = appconfig.getPurchaseStatus(rows[i].status);
		// if (rows[i].create_date != null) {
		// rows[i].create_date = FormatDate(rows[i].create_date);
		// }
		// if (rows[i].approval_date != null) {
		// rows[i].approval_date = FormatDate(rows[i].approval_date);
		// }
		// if (rows[i].vendor_accept_date != null) {
		// rows[i].vendor_accept_date = FormatDate(rows[i].vendor_accept_date);
		// }
		// if (rows[i].update_date != null) {
		// rows[i].update_date = FormatDate(rows[i].update_date);
		// }
	}
	return rows;
}

// function FormatDate(strTime) {
// var date = new Date(strTime);
// return date.getFullYear() + "-" + (date.getMonth() + 1) + "-"
// + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
// + ":" + date.getSeconds();
// }
