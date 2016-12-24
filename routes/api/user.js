var rpc = require('../../jsonrpc');
var mydb = require('../../mydb');
var bcrypt = require('bcryptjs');
var msg = require('../../message');

//=================================================================================================================================
module.exports.checkLogin=function(req) {
      if (req.session.user==null){
          return false;
      }
      return true;
}

//=================================================================================================================================
module.exports.doLogin=function(req, res, next,onreturn) {
   var params=req.body.params;
  //var tlsSession = req.socket.getSession();
  mydb.query('SELECT * FROM `account` WHERE `email`=?', [params.email], function (err, rows, fields) {
    if (err) {
      console.error(err.message);
      //rpc.senddanger(req,res,"DB error!");
      if(onreturn) onreturn(req,res,rpc.danger(req,"DB error!"));
      return;
    }
    //console.log(rows.length, rows);
    if (rows.length != 0) {
      var user = rows[0];
      if (params.email === user.email && bcrypt.compareSync(params.password, user.password_hash)) {
        if (user.locked == 1) {
          //rpc.senddanger(req,res,"your id was locked. Pls. call helpdesk to unlock.");
          if(onreturn) onreturn(req,res,rpc.danger(req,"your id was locked. Pls. call helpdesk to unlock."));
          return;
        }
        if (user.online === 1) {
          //already login
          if (user.sessionkey === req.sessionID) {
            console.log("already login");
            //same session            
            //rpc.sendsuccess(req,res,"Successful");
            if(onreturn) onreturn(req,res,rpc.success(req,"Successful."));
          } else {
            //kick previous session         
            console.log("kick previous login");
            KickOut(user.sessionkey);
            UpdateLoginInfo(user, req, res,onreturn);
          }
        } else {
          console.log("ok to login");
          UpdateLoginInfo(user, req, res,onreturn);
        }
        return;
      } else {
        //invalid password
        mydb.query('UPDATE `account` SET `failed_logins`=`failed_logins`+1, `last_attempt_ip`=? WHERE `email`=?',
          [req.ip, params.email], function (error, result) {
            if (error) {
              console.error(error.message);
            } else {
              console.log("update ok 11");
            }
          });
      }
    } else {
      //invalid account
    }
    //rpc.senddanger(req,res,"Invalid username or password");
    if(onreturn) onreturn(req,res,rpc.danger(req,"Invalid username or password!"));
  });
}
function KickOut(sid) {
  mydb.query('DELETE FROM `sessions` WHERE `sid`=?', sid, function (error, result) {
    if (error) {
      console.error(error.message);
    } else {
      console.log("delete ok");
    }
  });
}
function UpdateLoginInfo(user, req, res,onreturn) {
  //console.log(req.ip);
  mydb.query('UPDATE `account` SET `last_login`=now(), `last_ip`=?,`sessionkey`=?, `online`=1  WHERE `id`=?',
    [req.ip, req.sessionID, user.id], function (error, result) {
      if (error) {
        console.error(error.message);
        //rpc.senddanger(req,res,"Update DB failed!");
        if(onreturn) onreturn(req,res,rpc.danger(req,"Update DB failed!"));
      } else {
        console.log("update ok");
        req.session.user = user;
        //rpc.sendsuccess(req,res,"Successful");
        if(onreturn) onreturn(req,res,rpc.success(req,"Successful."));
    }
    });
}
//=================================================================================================================================
module.exports.doLogout=function(req, res, next,onreturn) {
  var id = req.session.user.id;
  mydb.query('UPDATE `account` SET `online`=0  WHERE `id`=? and `sessionkey`=?', [id, req.sessionID], function (error, result) {
    if (error) {
      console.error(error.message);
    }
    //console.log(result);
  });
  req.session.user = null;
  req.session.cookie.maxAge = 1;
  //rpc.sendsuccess(req,res,"Successful");
  if(onreturn) onreturn(req,res,rpc.success(req,"Successful."));
}
//=================================================================================================================================
module.exports.doRegister=function(req, res, next,onreturn) {
   var params=req.body.params;
   var result = {
    valid: true,
    resp:{
        inputName:msg.success(""),
        inputPhone: msg.success(""),
        inputEmail: msg.success(""),
        inputPassword: msg.success(""),
        inputPassword2: msg.success(""),
        inputAnswer: msg.success(""),
        status: msg.success("")
    }
   };
    SendResult=function(){
        //res.send(rpc.result(params.id,result.valid,result.resp));
        if(onreturn) onreturn(req,res,rpc.result(params.id,result.valid,result.resp));
    };
  //check if email exist?
  mydb.query('SELECT * FROM `account` WHERE `email`=?', [params.inputEmail], function (err, rows, fields) {
    if (err) {
      console.error(err.message);
      return;
    }
    if (rows.length != 0) {
      result.valid=false;
      result.resp.inputEmail = msg.danger('The email address already in used. Pls. use another email address.');
      SendResult();
    } else {
      validateRegInput(params, result,req);
      if (result.valid) {
        mydb.query('INSERT INTO `account` SET `groupid`=0,`email`=?,`username`=?,`phone`=?,`password_hash`=?,`joindate`=NOW()',
          [params.inputEmail, params.inputName, params.inputPhone, bcrypt.hashSync(params.inputPassword, 11)], function (error, dresult) {
            if (error) {
              console.error(error.message);
              result.valid=false;
              result.resp.status = msg.danger("DB error!");
            } else {
              result.resp.status = msg.success("Successful");
            }
            SendResult();
          });
      } else {
        SendResult();
      }
    }
  });
}
function validateRegInput(params, result,req) {
  exports.validateEmail(params, result);
  exports.validateName(params, result);
  exports.validatePhone(params, result);
  exports.validatePassword(params, result);
  exports.validateAnswer(params, result,req);
}
module.exports.validateAnswer=function(params, result,req){
  if (params.inputAnswer.length == 0) {
    result.resp.inputAnswer = msg.danger('Pls. input answer!');
    result.valid = false;
  }else if(req.session.answer!=params.inputAnswer.toLowerCase()){
    result.resp.inputAnswer = msg.danger('Incorrect answer!');
    result.valid = false;
  }
}
module.exports.validateEmail=function(params, result){
  var emailfilter = /^[a-zA-Z0-9]+[a-zA-Z0-9_.-]+[a-zA-Z0-9_-]+@[a-zA-Z0-9]+.+[a-z]{2,4}$/;
  if (!emailfilter.test(params.inputEmail)) {
    result.resp.inputEmail = msg.danger('invalid email address');
    result.valid = false;
  }
  if (params.inputEmail.length == 0) {
    result.resp.inputEmail = msg.danger('Pls.input email!');
    result.valid = false;
  }
}
module.exports.validateName=function(params, result){
  var containSpecial = /[(\~)(\!)(\@)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\+)(\=)(\[)(\])(\{)(\})(\|)(\\)(\;)(\:)(\')(\")(\/)(\<)(\>)(\?)(\)]+/;
  if (containSpecial.test(params.inputName)) {
    result.resp.inputName = msg.danger('invalid name.Name only allow alphanumeric and . - _ ,');
    result.valid = false;
  }
  if (params.inputName.length == 0) {
    result.resp.inputName = msg.danger('Pls.input name!');
    result.valid = false;
  }
}
module.exports.validatePhone=function(params,result){
  if (! /^[+]?[0-9]+([0-9]|[-]|[ ])+([0-9]|[ ])+$/.test(params.inputPhone)) {
    result.resp.inputPhone = msg.danger('invalid phone number');
    result.valid = false;
  }
  if (params.inputPhone.length == 0) {
    result.resp.inputPhone = msg.danger('Pls.input phone!');
    result.valid = false;
  }
}
module.exports.validatePassword=function(params, result) {
  if (params.inputPassword !== params.inputPassword2) {
    result.resp.inputPassword2 = msg.danger('password not match');
    result.valid = false;
  }

  var strongRegex = /^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\W).*$/g;
  var mediumRegex = /^(?=.{8,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$/g;
  var enoughRegex = /(?=.{8,}).*/g;

  if (enoughRegex.test(params.inputPassword)) {
    if (strongRegex.test(params.inputPassword)) {
      result.resp.inputPassword = msg.success('password is strong');
    } else {
      if (mediumRegex.test(params.inputPassword)) {
        result.resp.inputPassword = msg.success('password is middle');
      } else {
        result.resp.inputPassword = msg.warning('password is weak');
      }
    }
  } else {
    result.resp.inputPassword = msg.danger('password is too weak. Password length at least 8');
    result.valid = false;
  }
  if (params.inputPassword.length == 0) {
    result.resp.inputPassword = msg.danger('Pls.input password!');
    result.valid = false;
  }
  if (params.inputPassword2.length == 0) {
    result.resp.inputPassword2 = msg.danger('Pls. confirm password!');
    result.valid = false;
  }
}