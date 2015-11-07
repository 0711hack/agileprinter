var restify = require("restify");

var server = restify.createServer();
server.use(restify.bodyParser());
server.use(restify.CORS());

server.get("/", restify.serveStatic({
  "directory": "./static",
  "default": "index.html"
}));
server.get(/\/js\/?.*/, restify.serveStatic({
  "directory": "./static"
}));
server.get(/\/img\/?.*/, restify.serveStatic({
  "directory": "./static"
}));
server.get(/\/css\/?.*/, restify.serveStatic({
  "directory": "./static"
}));

server.listen(8080, function() {
  console.log("ui started");
});
