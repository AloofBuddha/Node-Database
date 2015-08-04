var http = require('http');
    url  = require('url');

var database = {}; // will need to read from file here

var setRegex = /^\/set\?.+=.+$/,  // /set?somekey=somevalue
    getRegex = /^\/get\?key=.+$/; // /get?key=somekey

http.createServer(requestListener).listen(4000);

function requestListener (request, response) { 
    var query = url.parse(request.url).query,
        parsedQuery, key, val; 

    // SET
    if (setRegex.test(request.url)) {
        parsedQuery = query.split('=');
        key = parsedQuery[0];
        val = parsedQuery[1];

        database[key] = val; // Note: w/o parsing, val is always a string
        console.log("Updated database", database);

        onSuccess(response, "Success: " + query);

    // GET
    } else if (getRegex.test(request.url)) {
        parsedQuery = query.split('=');
        key = parsedQuery[1];
        val = database[key];

        if (val !== undefined) {
            onSuccess(response, val);
        } else {
            onError(response, "Key '" + key + "' not found in database");
        }

    // Invalid Request
    } else {
        onError(response, "Invalid Request - " + request.url);
    }
}

function onSuccess (response, body) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end(body);
}

function onError (response, body) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end(body);
}