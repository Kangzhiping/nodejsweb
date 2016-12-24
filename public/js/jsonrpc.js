//Refer to:  http://www.jsonrpc.org/specification
function jsonrpc(){
    this.request=function(id,method,params){
        return {
            "jsonrpc": "2.0",
            "method":method,
            "params": params,
            "id": id
        };
    };
    function unexist(v){
        if(typeof(v)=="undefined")
            return true;
        else
            return false;
    }
    this.isRequest=function(data){
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
    };
    this.result=function(id,status,message){
        return {
            "jsonrpc": "2.0",
            "result": {
                "status": status,//true - ok or false - fail
                "message":message,
            },
            "id": id
        };
    };
    this.isResult=function(data){
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
    };
    this.error=function(id,error_code,message,data){
        return {
            "jsonrpc": "2.0",
            "error": {
                "code": error_code,//error code
                "message":message,
                "data":data
            },
            "id": id
        };
    };
    this.isError=function(data){
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
}
