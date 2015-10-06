var http = require('http');
var fs = require('fs');
var port = process.env.PORT || 8000;
var index = fs.readFileSync(__dirname +'/public/index.html').toString();
var redis  = require("redis");
var client = redis.createClient();
var qs = require('querystring');

var translatePost = function(request, callback) {
  var body = '';
  request.on('data', function(data) {
    body += data;
  });
  request.on('end', function() {
    var post = qs.parse(body);
    callback(post);
  });
};

function handler(request, response) {
  var url = request.url;
  if (url.length === 1 && request.method === "POST") {
    console.log('grapey');
    translatePost(request, function(data) {
      client.rpush("favourites", data.item, function(err, reply) {
        client.lrange("favourites", 0, -1, function(err, favourites) {
          if (err) {
            console.log(err);
          } else {
            var partOne = index.split('<!-- Where previous entries go --->')[0];
            var partTwo = index.split('<!-- Where previous entries go --->')[1];
            // response.write(partOne + '<li>' + favourites + '</li>' + partTwo);
            response.writeHead(200, {
              "Content-Type": "text/html"
            });
            response.end(partOne + '<li>' + favourites + '</li>' + partTwo);
          }
        });
      });
    });
  } else {
    response.writeHead(200, {
      "Content-Type": "text/html"
    });
    printData();
  }
}

var printData = function(request, response) {
  client.lrange("favourites", 0, -1, function(err, favourites) {
    if (err) {
      console.log(err);
    } else {
      var partOne = index.split('<!-- Where previous entries go --->')[0];
      var partTwo = index.split('<!-- Where previous entries go --->')[1];
      // response.write(partOne + '<li>' + favourites + '</li>' + partTwo);
      response.writeHead(200, {
        "Content-Type": "text/html"
      });
      response.end(partOne + '<li>' + favourites + '</li>' + partTwo);
    }
  });
};

http.createServer(handler).listen(port);
console.log('node http server listening on http://localhost:' + port);
