
var jsifClient = {};

jsifClient.createClientInDiv = function(id, game) {

    var client = {};

    client.divID = id;
    client.game = game;
    
    client.inputHandler = function(input) {
	game.handleInput(input, this);
    };

    
    client.inputBuffer = "";

    client.history = [];

    client.handleGameResponse = function(response) {

    };
    
    client.handleKeyEvent = function(e) {
	//console.log('handleKeyEvent(e) with e.which: ' + e.which);
	//console.log("e.keyCode: " + e.keyCode);
	//console.log("as string: " + String.fromCharCode(e.which));

	if (e.which == 8) {
	    console.log("backspace");

	    var len = this.inputBuffer.length;
	    if (len > 0) {
		this.inputBuffer = this.inputBuffer.substring(0, len - 1);
	    }
	    
	    e.preventDefault();
	}
	else if (e.which == 13) {
	    this.print('&gt&nbsp' + this.inputBuffer);
	    if (this.inputHandler) {
		(this.inputHandler)(this.inputBuffer);
	    }
	    this.inputBuffer = "";
	}
	else if (e.which == 32 || (e.which >= 48 && e.which <= 90)
		 || e.which  == 188) { // comma
	    //var key = e.which;
	    //if (key >= 65 && key <=90) { key = key + 32; }
	    this.inputBuffer = this.inputBuffer + e.key;
		// previously String.fromCharCode(key);
	}
	else {
	    console.log("Unhandled key with code: " + e.which);
	}

	this.refresh();
    };

    client.print = function(str) {
	this.history.push(str);
    };

    client.refresh = function() {
	var div = document.getElementById(this.divID);

	var content = "";

	for (var i = 0; i < this.history.length; i++) {
	    content = content + this.history[i] + '<br/><br/>';
	}
	content = content + '&gt&nbsp' + this.inputBuffer;
	div.innerHTML = content;
	div.scrollTop = div.scrollHeight;
	
    };

    client.init = function() {
    
	document.onkeydown = function(e) {
	    client.handleKeyEvent(e);
	};
    }
        
    return client;

};

jsifClient.connectToURL = function(url) {
    var game = {};

    game.url = url;
    
    game.handleInput = function(input, client) {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
		let txt = this.responseText;
		console.log(txt);
		var response = JSON.parse(txt);
		var content = response.content;
		console.log(typeof content);
		for (var i = 0; i < content.length; i++) {
		    console.log(content[i]);
		    client.print(content[i]);
		}
		console.log(content);
	    }
	};
	xhttp.open("GET", game.url);

    };
    
    return game;
};
