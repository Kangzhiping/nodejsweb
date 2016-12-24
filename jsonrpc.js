var msg = require('./message');
//Refer to:  http://www.jsonrpc.org/specification
function request(id,method,params){
    return {
        'jsonrpc': '2.0',
        'method':method,
        'params': params,
        'id': id
    };
}
function unexist(v){
    if(typeof(v)=="undefined")
        return true;
    else
        return false;
}
function isRequest(data){
    if(data==null)
        return false;
    if(unexist(data.jsonrpc))
        return false;
    if(unexist(data.method))
        return false;
    if(unexist(data.params))
        return false;
    if(unexist(data.id))
        return false;
    if(typeof(data.jsonrpc)!="string"||data.jsonrpc!=="2.0")
        return false;
    if(typeof(data.method)!="string")
        return false;
    if(data.id==null) 
        return false;
    return true;
}
function result(id,status,message){
    return {
        'jsonrpc': '2.0',
        'result': {
            'status': status,//true - ok or false - fail
            'message':message,
        },
        'id': id
    };
}
function isResult(data){
    if(data==null)
        return false;
    if(unexist(data.jsonrpc))
        return false;
    if(unexist(data.result))
        return false;
    if(unexist(data.result.status))
        return false;
    if(unexist(data.result.message))
        return false;
    if(unexist(data.id))
        return false;
    if(typeof(data.jsonrpc)!="string"||data.jsonrpc!=="2.0")
        return false;
    if(data.id==null) 
        return false;
    if(typeof(data.result.status)!="boolean")
        return false;
    return true;
}
function error(id,error_code,message,data){
    return {
        'jsonrpc': '2.0',
        'error': {
            'code': error_code,//error code
            'message':message,
            'data':data
        },
        'id': id
    };
}
function isError(data){
    if(data==null)
        return false;
    if(unexist(data.jsonrpc))
        return false;
    if(unexist(data.error))
        return false;
    if(unexist(data.error.code))
        return false;
    if(unexist(data.error.message))
        return false;
    if(unexist(data.id))
        return false;
    if(typeof(data.jsonrpc)!="string"||data.jsonrpc!=="2.0")
        return false;
    if(data.id==null) 
        return false;
    if(data.error.code==null)
        return false;
    return true;
}
function success(req,text){
    if(unexist(req.body.id))
        return result(0,true,msg.success(text));
    else
        return result(req.body.id,true,msg.success(text));
}
function danger(req,text){
    if(unexist(req.body.id))
        return result(0,false,msg.danger(text));
    else
        return result(req.body.id,false,msg.danger(text));
}
function info(req,text){
    if(unexist(req.body.id))
        return result(0,true,msg.info(text));
    else
        return result(req.body.id,true,msg.info(text));
}
function warning(req,text){
    if(unexist(req.body.id))
        return result(0,true,msg.warning(text));
    else
        return result(req.body.id,true,msg.warning(text));
}
function sendsuccess(req,res,text){
    res.send(success(req,text));
}
function senddanger(req,res,text){
    res.send(danger(req,text));
}
function sendwarning(req,res,text){
    res.send(warning(req,text));
}
function sendinfo(req,res,text){
    res.send(info(req,text));
}
module.exports.request=request;
module.exports.result=result;
module.exports.error=error;
module.exports.isRequest=isRequest;
module.exports.isResult=isResult;

module.exports.success=success;
module.exports.danger=danger;
module.exports.warning=warning;
module.exports.info=info;


module.exports.sendsuccess=sendsuccess;
module.exports.senddanger=senddanger;
module.exports.sendwarning=sendwarning;
module.exports.sendinfo=sendinfo;
