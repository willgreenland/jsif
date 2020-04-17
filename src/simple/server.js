
const express = require('express');
const app = express();
const port = 3000;

global.jsif = {};

require('./jsif.js');
require('./game.js');
require('./world.js');
require('./parser.js');
require('./english.js');
require('./samplegame.js');

var jsifServer = {};

jsifServer.clientIDs = [];
jsifServer.clients = [];
jsifServer.games = [];

jsifServer.handleInput = function(clientID, input) {
    for (var i = 0; i < this.clientIDs.length; i++) {
	if (clientID == this.clientIDs[i]) {
	    this.games[i].handleInput(input, this.clients[i]);
	    return this.clients[i].flush();
	}
    }
};

jsifServer.handleQuery = function(query) {
    var clientID = query.getClientID();
    var input = query.getInput();
    var response = this.handleInput(clientID, input);
    return response;
};

jsifServer.createSSClient = function() {
    var client = {};

    client.contentToSend = [];
    
    client.print = function(str) {
	this.contentToSend.push(str);
    };

    client.flush = function() {
	var output = {};
	output.content = this.contentToSend;
	var str = JSON.stringify(output);
	this.contentToSend = [];
	return str;
    };
    
    return client;
};

jsifServer.clientIDs.push("clientID");
jsifServer.clients.push(jsifServer.createSSClient());


var game = jsif.createBasicGame();
jsif.addSampleContent(game);
jsifServer.games.push(game);

app.get('/', (req, res) => {
    var query = {};

    var clientID = "clientID"; // FIXME
    var input = "look"; // FIXME
    var response = jsifServer.handleInput(clientID, input);
    
    res.send(response);
});

app.use('/static', express.static('static'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
