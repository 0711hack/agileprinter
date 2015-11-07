var restify = require("restify");

var server = restify.createServer();

server.get("/", restify.serveStatic({
  "directory": "./static",
  "default": "index.html"
}));
server.get(/\/js\/?.*/, restify.serveStatic({
  "directory": "./static"
}));

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
