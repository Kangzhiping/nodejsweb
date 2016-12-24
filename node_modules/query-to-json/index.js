

"use strict";

var query = {
  queryToJson: function( query ) {
      var result = {};
      if ( query.lastIndexOf( "?" ) === 0 ) {
        query = query.substr( 1 );
      }
      query.split( "&" ).forEach( function( part ) {
        var item = part.split( "=" );
        result[ item[ 0 ] ] = decodeURIComponent( item[ 1 ] );
      } );
      return result;
  },
  jsonToQuery: function( json ) {
    return "?" +
        Object.keys( json ).map( function( key ) {
            return encodeURIComponent( key ) + "=" +
                encodeURIComponent( json[ key ] );
        } ).join( "&" );;
  }
};

module.exports = query;
