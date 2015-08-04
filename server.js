'use strict';

var http = require('http'),
    url  = require('url'),
    fs   = require('fs');

var setRegex = /^\/set\?.+=.+$/,  // /set?somekey=somevalue
    getRegex = /^\/get\?key=.+$/; // /get?key=somekey

http.createServer(requestListener).listen(4000);

function requestListener (request, response) { 
  var query = url.parse(request.url, true).query;

  // SET
  if (setRegex.test(request.url)) 
    onSet(query, function (data) {
        console.log("Updated database", data);
        onSuccess("Success: database updated");
    });

  // GET
  else if (getRegex.test(request.url))
    onGet(query.key, function (err, data) {
      if (err) return onError(err);
      
      onSuccess(data);
    });

  // Invalid Request     
  else                               
    onError("Invalid Request - " + request.url);

  function onSet(query, callback) {
    fs.readFile('database.json', function (err, data) {
      var database = JSON.parse(data.toString()),
          key = Object.keys(query)[0],
          val = query[key];   // Note: w/o parsing, val is always a string
          
      database[key] = val;
          
      fs.writeFile('database.json', 
        JSON.stringify(database), 
        function () { callback(database); });
    });
  }

  function onGet(key, callback) {
    fs.readFile('database.json', function (err, data) {
      var database = JSON.parse(data.toString()),
          val      = database[key];

      if (val === undefined) 
        callback("Key '" + key + "' not found in database");
      else 
        callback(null, val);
    }); 
  }

  function onSuccess (body) {
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end(body);
  }

  function onError (body) {
      response.writeHead(404, {'Content-Type': 'text/plain'});
      response.end(body);
  }
}