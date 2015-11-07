function boardsSuccess(res) {
  var html = "";
  res.forEach(function(board) {
    html += "<li>" + board.name + "</li>";
  });
  $("p").hide();
  $("ul").html(html);
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
