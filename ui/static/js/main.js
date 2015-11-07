function configBoard(board) {
  var config = {
  "trello": {
      "key": Trello.key(),
      "token": Trello.token(),
      "board": board
    }
  };
  $.ajax({
    "url": "http://" + window.location.hostname + ":8081/config",
    "type": "POST",
    "data": JSON.stringify(config),
    "contentType": "application/json",
    "dataType": "json",
    "success": function() {
      console.log("configured");
    },
    "error": function() {
      alert("error while configuring");
    }
  });
}

function boardsSuccess(res) {
  var html = "";
  res.forEach(function(board) {
    html += "<li><a href='#' data-board='" + board.id + "'>" + board.name + "</a></li>";
  });
  $("p").hide();
  $("ul").html(html);
  $("a[data-board]").click(function(e) {
    configBoard($(this).data("board"));
    e.preventDefault();
  });
}
function boardsFailure() {
  alert("error while getting boards information");
}

function memberSuccess(res) {
  Trello.rest("GET", "/members/" + res.username + "/boards", boardsSuccess, boardsFailure);
}
function memberFailure() {
  alert("error while getting member information");
}

function authenticationSuccess() { 
  Trello.rest("GET", "/tokens/" + Trello.token() + "/member", memberSuccess, memberFailure);
}
function authenticationFailure() {
  alert("error while authenticating");
}

var a = Trello.authorize({
  "name": "Agile Printer",
  "expiration": "never",
  "success": authenticationSuccess,
  "error": authenticationFailure
});

$(document).ready(function() {
  
});
