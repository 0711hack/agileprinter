var fs = require("fs");

var Tinkerforge = require("tinkerforge");
var restify = require("restify");
var Trello = require("trello");

var server = restify.createServer();
server.use(restify.bodyParser());
server.use(restify.CORS());

server.post("/config", function (req, res, next) {
  console.log("POST received", req.body);
  fs.writeFile("./config.json", JSON.stringify(req.body), function(err) {
    if (err) {
      console.log("error while writinf config", err);
      res.send(500);
    } else {
      res.send(204);
    }
    return next();
  });
});

console.log("Starting server API...");
server.listen(8081, function() {
  console.log("Server API started");
});

var ipcon = new Tinkerforge.IPConnection();
var db = new Tinkerforge.BrickletDualButton("vEm", ipcon);

function print(cb) {
  var config = require("./config.json");
  var trello = new Trello(config.trello.key, config.trello.token);
  trello.getListsOnBoard(config.trello.board, function(err, lists) {
    if (err) {
      cb(err);
    } else {
      console.log("lists", lists);
      cb();
    }
  });
  // TODO implement
}

ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED, function(connectReason) {
  console.log("Master Brick connection established.");
});

db.on(Tinkerforge.BrickletDualButton.CALLBACK_STATE_CHANGED, function (buttonLeft, buttonRight) {
  if (buttonLeft === Tinkerforge.BrickletDualButton.BUTTON_STATE_PRESSED) {
    console.log("print");
    print(function(err) {
      if (err) {
        console.log("Error: " + err);
      }
    });
  }
});

console.log("Connecting with Master Brick...");
ipcon.connect("192.168.62.140", 4223, function (err) {
  console.log("Error: " + err);
  process.exit(1);
});

process.on("SIGINT", function() {
  console.log("disconnect");
  ipcon.disconnect();
  process.exit(0);
});
