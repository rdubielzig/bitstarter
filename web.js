var express = require('express');

var app = express.createServer(express.logger());


app.get('/', function(request, response) {
  var fs = require('fs');
  var content = fs.readFileSync('index.html').toString();
  response.send(content);
});

var port = process.env.PORT || 8080;
app.use(express.static(__dirname));
app.listen(port, function() {
  console.log("Listening on " + port);
});
