var apphome=process.env.APP_NAME||'/cocos';
var appconfig={
    home: apphome, // put '' if no use '/', else put '/xxx'
    port: process.env.APP_PORT||'3001',
    db:{
        host: process.env.APP_DB_HOST||'127.0.0.1',
        port: process.env.APP_DB_PORT||'3306',
        user: process.env.APP_DB_USER||'test',
        password: process.env.APP_DB_PASSWORD||'A1739#s0',
        database: process.env.APP_DB_NAME||'nodejsdb',
        dateStrings: true
    },
    session:{
        secret: 'thesessionsecret gfsdgjdsmg;ldf;sg',
    }
};
module.exports=appconfig;
var usergroup={
		'0':'Newer',
		'1':'Buyer',
		'2':'Manager',
		'3':'Supplier',
		'4':'InventoryController',
		'5':'Auditor',
		'6':'Accountant',
		'126':'ID Admin',
		'127':'Administrator'
};
module.exports.isBuyer=function(groupid){
    if(groupid=='1'){
        return true;
    }else
        return false;
}
module.exports.isManager=function(groupid){
    if(groupid=='2'){
        return true;
    }else
        return false;
}
module.exports.isSupplier=function(groupid){
    if(groupid=='3'){
        return true;
    }else
        return false;
}
module.exports.isIdAdmin=function(groupid){
    if(groupid=='126'){
        return true;
    }else
        return false;
}
module.exports.isAdministrator=function(groupid){
    if(groupid=='127'){
        return true;
    }else
        return false;
}
var routegroup=[
    {path:'',group:['0','1','2','3','4','5','6','126']},
    {path:'/todo',group:['0','1','2','3','4','5','6','126']},
    {path:'/user',group:['0','1','2','3','4','5','6','126']},
    {path:'/user/edit-profile',group:['0','1','2','3','4','5','6','126']},
    {path:'/user/login',group:['0','1','2','3','4','5','6','126']},
    {path:'/user/logout',group:['0','1','2','3','4','5','6','126']},
    {path:'/user/register',group:['126']},
    {path:'/user/change',group:['0','1','2','3','4','5','6','126']},
    {path:'/user/update',group:['0','1','2','3','4','5','6','126']},
    {path:'/user/home',group:['0','1','2','3','4','5','6','126']},
    {path:'/user/list',group:['126']},
    {path:'/api/user',group:['0','1','2','3','4','5','6','126']},
    {path:'/purchase/create',group:['1']},
    {path:'/purchase/update',group:['1']},
    {path:'/purchase/cancel',group:['1']},
    {path:'/purchase/recall',group:['1']},
    {path:'/purchase/submit',group:['1']},
    {path:'/purchase/review',group:['1']},
    {path:'/purchase/approve',group:['2']},
    {path:'/purchase/reject',group:['2']},
    {path:'/purchase/publish',group:['1','2']},
    {path:'/purchase/confirm',group:['3']},
    {path:'/purchase/close',group:['1']},
    {path:'/purchase/complete',group:['1']},
    {path:'/purchase/query',group:['1','2','3']},
    {path:'/purchase/changestatus',group:[]},
    {path:'/purchase',group:['1','2','3']},
];
var grouproutes=new Map(); 
console.log("loading group-routes table");

for(var i in routegroup){
    for(var j in routegroup[i].group){
        //console.log(r[i].group[j]);
        grouproutes[routegroup[i].group[j]+'#'+apphome+routegroup[i].path]=true;
    }
}

module.exports.checkAccessRight=function(group,path){
    if(this.isAdministrator(group)){
        return true;//Administrator can use any function!
    }
    if(path[path.length-1]=='/'){
        rpath=path.substr(0,path.length-1);
    }else{
        rpath=path;
    }
    console.log(group+'#'+rpath,grouproutes[group+'#'+rpath]);
    if(grouproutes[group+'#'+rpath])
        return true;
    else
        return false;
}

module.exports.getUserGroup=function(groupid){
    id=getFieldValue(groupid);
    if(!id)
        return 'Tourist';
    else
        return usergroup[id];
}
module.exports.getUserGroupList=function(){
    return usergroup;
}
var purchaseStatus={
    '0':'Drafted',
    '1':'Submitted',
    '3':'Approved',
    '4':'Published',
    '5':'Confirmed',
    '6':'Completed',
    '7':'Cancel',
    '2':'Reviewed',
};
var purchaseStatusCode=new Map();
for(var i in purchaseStatus){
    purchaseStatusCode[purchaseStatus[i]]=i;
}
module.exports.getPurchaseStatus=function(status_code){
    return purchaseStatus[status_code];
}
module.exports.getPurchaseStatusCode=function(status_str){
    return purchaseStatusCode[status_str];
}

var productCategory={
    '0':'Miscellaneous',
    '1':'Stationery',
    '2':'Food',
    '3':'Electric Device',
    '4':'Computer',
    '5':'Toy',
    '6':'Gift',
};
module.exports.getProductCategory=function(id){
    return productCategory[id];
}
module.exports.render=function(res,tmpl,title,data,callback){
    var layout={
        title: title,
        apphome:appconfig.home,
        productCategory:productCategory,
        purchaseStatusList:purchaseStatus
    };
    if(typeof(data)=='undefined'||!data){
        data=layout;
    }else{
        for(var v in layout){
            data[v]=layout[v];
        }
    }
    if(!res.locals.user){
        data['user']='';
    }
    res.render(tmpl,data,callback);
}
function getFieldValue(field){
    if(typeof(field)=='undefined'){
        return null;
    }else{
        return field;
    }
}
module.exports.getFieldValue=getFieldValue;