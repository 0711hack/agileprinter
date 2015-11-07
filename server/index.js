var Tinkerforge = require("tinkerforge");
var restify = require("restify");
var fs = require("fs");

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

server.listen(8081, function() {
  console.log("server API started");
});

var ipcon = new Tinkerforge.IPConnection();
var db = new Tinkerforge.BrickletDualButton("vEm", ipcon);

function print() {
  // TODO implement
}

ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED, function(connectReason) {
  console.log("connected");
});

db.on(Tinkerforge.BrickletDualButton.CALLBACK_STATE_CHANGED, function (buttonLeft, buttonRight) {
  if (buttonLeft === Tinkerforge.BrickletDualButton.BUTTON_STATE_PRESSED) {
    console.log("print");
    print();
  }
});

ipcon.connect("192.168.62.140", 4223, function (err) {
  console.log("Error: " + err);
  process.exit(1);
});

process.on("SIGINT", function() {
  console.log("disconnect");
  ipcon.disconnect();
  process.exit(0);
});
