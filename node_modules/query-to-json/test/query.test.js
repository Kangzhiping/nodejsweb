var assert = require( "assert" );

var queryTest = require( "../index.js" );
var query1 = "?param1=foo&param2=bar";
var object1 = {
  param1: "foo",
  param2: "bar"
};

describe( "queryTest", function() {
  describe( "#queryToJson()", function() {
    it( "should return true", function() {
      var result = queryTest.queryToJson( query1 );
      console.log( result );
      assert( typeof result === "object" );
      assert( result.param1 === "foo" );
      assert( result.param2 === "bar" );
    } );
  } );
  describe( "#jsonToQuery()", function() {
    it( "should true", function() {
      assert( queryTest.jsonToQuery( object1 ) === query1 );
    } );
  } );
} );
