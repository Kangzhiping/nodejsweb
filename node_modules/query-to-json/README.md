
# query-string [![Build Status](https://travis-ci.org/juanpicado/query-to-json.svg?branch=master)](https://travis-ci.org/juanpicado/query-to-json)

## Install

```
$ npm i --save query-to-json
```

## Usage


##### Query to JSON

    var query = require( "query-to-json" );
    var parsedQuery = query.queryToJson("?param1=foo&param2=bar");
    //=> {
      param1: "foo",
      param2: "bar"
    }

##### JSON to Query

    var query = require( "query-to-json" );
    var object1 = {
       param1: "foo",
       param2: "bar"
    };
    var parsedQuery = jsonToQuery(object1);
    
    //=> "?param1=foo&param2=bar"
    
    
