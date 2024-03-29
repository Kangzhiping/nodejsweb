var mysql = require('mysql');
var appconfig = require('./config');
var connection = mysql.createConnection(appconfig.db);
connection.connect();
connection.on('error', function (err) {
  console.error('db error', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    connection.connect();
  } else {
    throw err;
  }
});
module.exports.query=function(str, value, callback) {
  connection.query(str, value, callback);
}

exports.NOT_NULL_FLAG	        =1;		  /* Field can't be NULL */
exports.PRI_KEY_FLAG          =2;		  /* Field is part of a primary key */
exports.UNIQUE_KEY_FLAG       =4;		  /* Field is part of a unique key */
exports.MULTIPLE_KEY_FLAG     =8;		  /* Field is part of a key */
exports.BLOB_FLAG	            =16;		/* Field is a blob */
exports.UNSIGNED_FLAG	        =32;		/* Field is unsigned */
exports.ZEROFILL_FLAG	        =64;		/* Field is zerofill */
exports.BINARY_FLAG	          =128;		/* Field is binary   */
/* The following are only sent to new clients */
exports.ENUM_FLAG	            =256;		/* field is an enum */
exports.AUTO_INCREMENT_FLAG   =512;		/* field is a autoincrement field */
exports.TIMESTAMP_FLAG	      =1024;	/* Field is a timestamp */
exports.SET_FLAG	            =2048;	/* field is a set */
exports.NO_DEFAULT_VALUE_FLAG =4096;	/* Field doesn't have default value */
exports.ON_UPDATE_NOW_FLAG    =8192;  /* Field is set to NOW on UPDATE */
exports.NUM_FLAG	            =32768;	/* Field is num (for clients) */

module.exports.getPrimaryKey=function(fields){
  var keys=new Array();
  var j=0;
  for(var i in fields){
    field=fields[i];
    if(field.flags&this.PRI_KEY_FLAG){
          keys[j]=field.name;
    }
  }
  console.log(keys);
  return keys;
}