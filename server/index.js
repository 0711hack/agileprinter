var fs = require("fs");
var exec = require("child_process").exec;

var Tinkerforge = require("tinkerforge");
var restify = require("restify");
var Trello = require("trello");
var async = require("async");
var pdfkit = require("pdfkit");

var server = restify.createServer();
server.use(restify.bodyParser());
server.use(restify.CORS());

server.post("/config", function (req, res, next) {
  fs.writeFile("./config.json", JSON.stringify(req.body), function(err) {
    if (err) {
      console.log("error", JSON.stringify(err));
      res.send(err);
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

function createPDF(deck, cb) {
  var pageConfig = {size: [250, 80], margin: 0};
  var doc = new pdfkit(pageConfig);
  var stream = doc.pipe(fs.createWriteStream("./deck.pdf"));
  deck.forEach(function(item, i) {
    if (i > 0) {
      doc.addPage(pageConfig);
    }
    if (item.type === "list") {
      doc.roundedRect(1, 1, 248, 78, 3).stroke();
      doc.fontSize(24);
    } else {
      doc.roundedRect(1, 1, 248, 78, 3).stroke();
      doc.fontSize(16);
    }
    doc.text(item.name, 10, 5);
    doc.text("");
    doc.text("");
  });
  doc.end();
  stream.on("finish", function() {
    console.log("finish");
    cb();
  });
}

function lp(cb) {
  var child = exec("lp -c ./deck.pdf", function(err, stdout, stderr) {
    if (err) {
      cb(err);
    } else {
      cb();
    }
  });
}

function getDeck(cb) {
  var config = require("./config.json");
  var trello = new Trello(config.trello.key, config.trello.token);
  var deck = [];
  trello.getListsOnBoard(config.trello.board, function(err, lists) {
    if (err) {
      cb(err);
    } else {
      async.eachLimit(lists, 5, function(list, cb) {
        trello.getCardsOnList(list.id, function(err, cards) {
          if (err) {
            cb(err);
          } else {
            deck.push({
              "type": "list",
              "name": list.name
            });
            cards.forEach(function(card) {
              deck.push({
                "type": "card",
                "name": card.name
              });
            });
            cb();
          }
        });
      }, function(err) {
        if (err) {
          cb(err);
        } else {
          cb(null, deck);
        }
      });
    }
  });
}

ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED, function(connectReason) {
  console.log("Master Brick connection established.");
});

db.on(Tinkerforge.BrickletDualButton.CALLBACK_STATE_CHANGED, function (buttonLeft, buttonRight) {
  if (buttonLeft === Tinkerforge.BrickletDualButton.BUTTON_STATE_PRESSED) {
    console.log("print");
    getDeck(function(err, deck) {
      if (err) {
        console.log("error", JSON.stringify(err));
      } else {
        createPDF(deck, function(err) {
          if (err) {
            console.log("error", JSON.stringify(err));
          } else {
            lp(function(err) {
              if (err) {
                console.log("error", JSON.stringify(err));
              } else {
                console.log("printed");
              }
            });
          }
        });
      }
    });
  }
});

console.log("Connecting with Master Brick...");
ipcon.connect("localhost", 4223, function (err) {
  console.log("error", JSON.stringify(err));
  process.exit(1);
});

process.on("SIGINT", function() {
  console.log("disconnect");
  ipcon.disconnect();
  process.exit(0);
});
