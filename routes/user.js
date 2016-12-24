var express = require('express');
var router = express.Router();
var mydb = require('../mydb');
var bcrypt = require('bcryptjs');
var appconfig = require('../config');
var rpc = require('../jsonrpc');
var userapi = require('./api/user');
var msg = require('../message');
var qjtl = require( "query-to-json" );

/*load country table*/
var countryList=new Map();
console.log('Loading country table...');
mydb.query('select * from country order by code3 asc',function (err, rows, fields){
  for(var r in rows){
    countryList[rows[r].code3]=rows[r];
  }
});
/* /user/xxx */
router.get('/', function (req, res, next) {
    if(!req.session.resp){
      resp={
        inputName:msg.success(""),
        inputPhone: msg.success(""),
        status: msg.success("")
      };
    }else{
      resp= req.session.resp;
      req.session.resp=null;
    }
    if(!req.session.input){
        input=req.session.user;
    }else{
        input=req.session.input;
        req.session.input=null;
    }
    if(!countryList[input.country])
      country='';
    else
      country=countryList[input.country];

    if(appconfig.isBuyer(req.session.user.groupid)){
      qstr='select * from `purchase_detail` where `create_person`=? or `update_person`=?';
    }else if(appconfig.isManager(req.session.user.groupid)){
      qstr='select * from `purchase_detail` where `approval_person`=? '      
    }else if(appconfig.isSupplier(req.session.user.groupid)){
      qstr='select * from `purchase_detail` where `vendor`=?';
    }else{
      qstr='select 1 from `purchase_detail` where `purchase_no` is null';
    }
    mydb.query(qstr,[req.session.user.username,req.session.user.username],function(err,rows,fields){
      if(err) console.log(err.message);
      appconfig.render(res,'profile','user profile',{
        username:input.username, 
        group:appconfig.getUserGroup(req.session.user.groupid),
        email:req.session.user.email,
        phone:input.phone,
        company:input.company,
        country:country.short_en,
        address:input.address,
        resp:resp,
        rows:rows
      });
    });
});
router.get('/edit-profile', function (req, res, next) {
    if(!req.session.resp){
      resp={
        inputName:msg.success(""),
        inputPhone: msg.success(""),
        status: msg.success("")
      };
    }else{
      resp= req.session.resp;
      req.session.resp=null;
    }
    var id=appconfig.getFieldValue(req.query.id);
    console.log(id);
    if(id==null||id==req.session.user.id){
      //edit user profile by himself
      if(!req.session.input){
            input=req.session.user;
      }else{
          input=req.session.input;
          input.email=req.session.user.email;
          req.session.input=null;
      }
      appconfig.render(res,'editprofile','Edit Profile',{
        id:null,
        username:input.username, 
        group:req.session.user.groupid,
        grouplist:appconfig.getUserGroupList(),
        email:input.email,
        phone:input.phone,
        company:input.company,
        country:input.country,
        countrylist:countryList,
        address:input.address,
        resp:resp
      });      
    }else{
      if(appconfig.isAdministrator(req.session.user.groupid)){
        //update profile by administrator
        mydb.query('SELECT * from `account` where `id`=?',[id],function(err,rows,field){
          if(err){
            console.log(err.message);
            res.redirect(appconfig.home+'/user/list');
          }else{
            if(rows.length>0){
              appconfig.render(res,'editprofile','Edit UserProfile',{
                id:id,
                username:rows[0].username, 
                group:rows[0].groupid,
                grouplist:appconfig.getUserGroupList(),
                email:rows[0].email,
                phone:rows[0].phone,
                company:rows[0].company,
                country:rows[0].country,
                countrylist:countryList,
                address:rows[0].address,
                resp:resp
              });
            }else{
              res.redirect(appconfig.home+'/user/list');
            }
          }
        });      
      }else{
        res.redirect(appconfig.home+'/user/unauth?path='+req.originalUrl);
      }
  }
});
router.get('/list', function (req, res, next) {
  mydb.query('SELECT * from `account`',[],function(err,rows,field){
      if(err){
        console.log(err.message);
      }
      appconfig.render(res,'userlist','User list',{rows:rows,groupList:appconfig.getUserGroupList()});
  });
});
router.post('/update', doUpdate);
router.post('/change', doChangePassword);
router.get('/change', function (req, res, next) {
    if(!req.session.resp){
      resp={
        inputName:msg.success(""),
        inputPhone: msg.success(""),
        status: msg.success("")
      };
    }else{
      resp= req.session.resp;
      req.session.resp=null;
    }
    appconfig.render(res,'changepassword','change password',{
      resp:resp
    });
});
router.get('/login', function (req, res, next) {
  if (req.session.user == null) {
    var email=req.session.email;
    var password=req.session.password;
    req.session.email=null;
    req.session.password=null;
    appconfig.render(res,'login','Login',{
      email:email,
      password:password
    });
  } else {
    res.redirect(appconfig.home+'/user/');
  }
});
router.post('/login', doLogin);
router.get('/logout', doLogout);
router.get('/home', function (req, res, next) {
  res.redirect(appconfig.home+'/');
});
router.get('/register', function (req, res, next) {
    appconfig.render(res,'register','register',{
      question:appconfig.home+'/captcha'
    });
});
router.post('/register', doRegister);
router.get('/resetpassword', function (req, res, next) {
  appconfig.render(res,'forgotpassword','forgotpassword');
});
router.post('/forgotpassword', doResetpassword);

router.get('/resetpassword', function (req, res, next) {
    appconfig.render(res,'resetpassword','resetpassword');
});
router.post('/resetpassword', doResetpassword);

router.get('/unauth', function (req, res, next) {
  appconfig.render(res,'unauth','unauth',{
    path:req.query.path
  });
});

function doLogin(req, res, next) {
  var email=req.body.email;
  req.body=rpc.request(1,"login",{email:req.body.email,password:req.body.password});
  userapi.doLogin(req,res,next,function(req,res,rpcresult){
    console.log(rpcresult.result.status);
    if(rpcresult.result.status)
      res.redirect(appconfig.home+'/user');
    else{
      req.session.error=rpcresult.result.message.text;
      req.session.email=email;
      res.redirect(appconfig.home+'/user/login');
    }
  });
}

//=================================================================================================================================
function doLogout(req, res, next) {
  req.body=rpc.request(1,"logout",{});
  userapi.doLogout(req,res,next,function(req,res,rpcresult){
    res.redirect(appconfig.home+'/user/login');
  });
}
//=================================================================================================================================
function doRegister(req, res, next) {
  var email=req.body.email;
  var password=req.body.password;
  req.body=rpc.request(1,"register",{
    email:req.body.email,password:req.body.password
  });
  userapi.doRegister(req,res,next,function(req,res,rpcresult){
    if(rpcresult.result.status){
      req.session.email=email;
      req.session.password=password;
      res.redirect(appconfig.home+'/user/login');
    }else{
      req.session.error=rpcresult.result.message.status.text;
      res.redirect(appconfig.home+'/user/register');
    }
  });
}
//===============================================================================================================================
function doResetpassword(req, res, next) {
//todo: send a email to user with a temp password, and request user to change password on next login.
}
//===============================================================================================================================
function doUpdate(req, res, next) {
//todo: update information for current login user
   var result = {
    valid: true,
    resp:{
        inputName:msg.success(""),
        inputPhone: msg.success(""),
        status: msg.success("")
    }
   };
  userapi.validateName(req.body,result);
  userapi.validatePhone(req.body,result);
  //userapi.validateCountry(req.body,result);
  
  req.session.input={
    username:req.body.inputName,
    group:req.body.inputGroup,
    phone:req.body.inputPhone,
    country:req.body.inputCountry,
    address:req.body.inputAddr,
    company:req.body.inputCompany
  };


  if(!result.valid){
    result.resp.status=msg.danger('Invalid input!');
    req.session.resp=result.resp;
    res.redirect(appconfig.home+'/user/edit-profile');
    return;
  }
  var id=appconfig.getFieldValue(req.query.id);
  if(id==null||id==req.session.user.id){
    mydb.query('UPDATE `account` SET `username`=?, `phone`=?, `country`=?,`address`=?,`company`=?  WHERE `id`=? and `sessionkey`=?', 
    [req.body.inputName,req.body.inputPhone,req.body.inputCountry,
    req.body.inputAddr,req.body.inputCompany,req.session.user.id, req.sessionID], function (error, qresult) {
      if (error) {
        console.error(error.message);
        result.resp.status=msg.danger('Update failed - db error!');
      }else{
        //console.log(req.body);
        req.session.user.username=req.body.inputName;
        req.session.user.phone=req.body.inputPhone;
        req.session.user.country=req.body.inputCountry;
        req.session.user.address=req.body.inputAddr;
        req.session.user.company=req.body.inputCompany;
        result.resp.status=msg.success('Update successful!');
      }
      req.session.resp=result.resp;
      res.redirect(appconfig.home+'/user/edit-profile');
    });
  }else{
    if(appconfig.isAdministrator(req.session.user.groupid)){
      mydb.query('UPDATE `account` SET `email`=?,`groupid`=?,`username`=?, `phone`=?, `country`=?,`address`=?,`company`=?  WHERE `id`=?', 
      [req.body.inputEmail,req.body.inputGroup,req.body.inputName,req.body.inputPhone,req.body.inputCountry,
    req.body.inputAddr,req.body.inputCompany,id], function (error, qresult) {
        if (error) {
          console.error(error.message);
          result.resp.status=msg.danger('Update failed - db error!');
        }else{
          console.log(req.body);
          console.log(qresult,id);
          result.resp.status=msg.success('Update successful!');
        }
        req.session.resp=result.resp;
        res.redirect(appconfig.home+'/user/edit-profile?id='+id);
      });      
    }else{
        result.resp.status=msg.danger('You can only allow to update your profile!');
        req.session.resp=result.resp;
        res.redirect(appconfig.home+'/user/edit-profile?id='+id);
    }
  }
}
//===============================================================================================================================
function doChangePassword(req, res, next) {
//todo: change password for current login user
   var result = {
    valid: true,
    resp:{
        inputPassword:msg.success(""),
        inputPassword2: msg.success(""),
        status: msg.success("")
    }
   };
  userapi.validatePassword(req.body,result);
  if(!result.valid){
    result.resp.status=msg.danger('Invalid password input!');
    req.session.resp=result.resp;
    res.redirect(appconfig.home+'/user/change');
    return;
  }
  mydb.query('UPDATE `account` SET `password_hash`=? WHERE `id`=? and `sessionkey`=?', 
  [bcrypt.hashSync(req.body.inputPassword, 11),req.session.user.id, req.sessionID], function (error, qresult) {
    if (error) {
      console.error(error.message);
      result.resp.status=msg.danger('Update failed - db error!');
    }else{
      console.log(req.body);
      result.resp.status=msg.success('Update successful!');
    }
    req.session.resp=result.resp;
    res.redirect(appconfig.home+'/user/change');
  });
  
}
//===============================================================================================================================

module.exports = router;
