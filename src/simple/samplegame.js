/**
 * samplegame.js
 *
 */

// singleton game (both game and client run in browser):
//
// include this file after the jsif library, and call the
// following function from the document body "onload"

function launchLocalGame() {

    var game = jsif.createBasicGame();

    jsif.addSampleContent(game);
    
    var client = jsifClient.createClientInDiv("content", game);
    client.init();
}

// remote game (client in browser, game at URL)
//
// include this file after the jsif-client script and call the
// following function from document body onload

var jsif = (typeof window === 'undefined' ? global.jsif : window.jsif);

if (!jsif) {
    jsif = {};
}

function launchRemoteGame() {

    var game = jsifClient.connectToURL("http://localhost:3000");

    var client = jsifClient.createClientInDiv("content", game);
    client.init();    
}

jsif.addSampleContent = function(game) {
    game.objs.startRoom = game.world.create
    ("Room 101", "room",
     function (obj) {
	 obj.description = "You are in a room with four plain white walls. There is a small cubicle occupying one corner of the room. A door leads north.";
	 obj.set(game.attrs.LIT_INSIDE, true);
     });

    game.objs.corridor = game.world.create
    ("Corridor", "corridor",
     function(obj) {
	 obj.description = "You are in the corridor. A door leads south.";
	 obj.set(game.attrs.LIT_INSIDE, true);
     });
    
    game.objs.officeDoor = game.world.create
    ("door", "door",
     function(obj) {
	 obj.description = "A plain white door.";
	 obj.set(game.attrs.OPEN, false);
	 obj.set(game.attrs.OPENABLE, true);
	 obj.set(game.attrs.LOCKABLE, true);
	 obj.set(game.attrs.LOCKED, true);
	 obj.set(game.attrs.SCENERY, true);
	 game.objs.startRoom.setPortal(obj, game.compass.N, () => game.objs.corridor);
	 game.objs.corridor.setPortal(obj, game.compass.S, () => game.objs.startRoom);
     });

    
    game.objs.silverKey = game.world.create
    ("silver key", "silver key", function(obj) {
	obj.description =
	    "A shiny silver key, intricately wrought.";
	game.objs.officeDoor.set(game.attrs.KEY, obj);
    });
    game.objs.silverKey.moveTo(game.objs.startRoom);

    var skeyTopic = game.world.create("silver key", "silver key");
    skeyTopic.moveTo(game.topics);

    game.objs.apple = game.world.create
    ("apple", "apple", function(obj) {
	obj.description = "A tasty-looking red apple.";
	obj.set(game.attrs.EDIBLE, true);
    });
    game.objs.apple.moveTo(game.objs.startRoom);

    game.objs.cubicle = game.world.create
    ("cubicle", "cubicle", function(obj) {
	obj.description = "A small cubicle with waist-high walls.";
	obj.set(game.attrs.ENTERABLE, true);
	obj.set(game.attrs.TRANSPARENT, true);
	obj.set(game.attrs.SCENERY, true);
    });
    game.objs.cubicle.moveTo(game.objs.startRoom);

    game.objs.desk = game.world.create
    ("desk", "desk", function(obj) {
	obj.description = "A simple, functional desk.";
	obj.set(game.attrs.ENTERABLE, true);
	obj.set(game.attrs.SUPPORTER, true);
	obj.set(game.attrs.SCENERY, true);
    });
    game.objs.desk.moveTo(game.objs.cubicle);
    
    game.objs.cardboardBox = game.world.create
    ("cardboard box", "cardboard box", function(obj) {
	obj.description = "A large cardboard box with an opening cut in one side, just big enough for you to crawl in and out.";
	obj.nameAsLocation = "Inside the cardboard box";
	obj.set(game.attrs.ENTERABLE, true);
    });
    game.objs.cardboardBox.moveTo(game.objs.startRoom);

    game.objs.strangeMachine = game.world.create
    ("strange machine", "strange machine", function(obj) {
	obj.description = "A strange machine, about the sie of a large photocopier. It has a single red button on the side.";
	obj.set(game.attrs.STATIC, true);
	obj.set(game.attrs.TRANSPARENT, true);
    });
    game.objs.strangeMachine.moveTo(game.objs.startRoom);

    game.objs.redButton = game.world.create
    ("red button", "red button", function(obj) {
	obj.description = "A large red button. It seems to glow faintly.";
	obj.set(game.attrs.SCENERY, true);
	obj.before('push', 1, function(p, second) {
	    p.print("The machine makes a brief humming sound, then falls silent again.");
	    if (game.objs.apple.parent == null) {
		p.print("An apple appears!");
		game.objs.apple.moveTo(game.objs.startRoom);
	    }
	    return true;
	});
    });
    game.objs.redButton.moveTo(game.objs.strangeMachine);
    
    game.objs.merlin = game.world.create("Merlin", "merlin", function(obj) {
	obj.description = "Merlin is a wizard.";
	obj.set(game.attrs.PROPER, true);
	obj.set(game.attrs.ANIMATE, true);
	obj.before('ask', 1, function(p, second) {
	    if (second == skeyTopic) {
		p.print('"Fine workmanship. But totally unmagical."');
		return true;
	    }
	});
	obj.addOrders(function(action, p) {
	    console.log("Checking new orders for Merlin!");
	    if (action.actionName == 'eat') {
		p.print('"I\'m not hungry," says Merlin.');
		return true;
	    }
	});

	obj.daemon = function(p) {
	    if (game.objs.apple.isReachableFromCeiling
		(game.objs.merlin.getReachableCeiling()).val) {
		game.objs.apple.remove();
		p.print("Merlin eats the apple.");
	    }
	    else {
		p.print('"I could really use something to eat right now," says Merlin.');
	    }
	};
    });
    game.objs.merlin.moveTo(game.objs.startRoom);

    game.objs.smallBox = game.world.create
    ("small box", "small wooden box",
     function(obj) {
	 obj.description = "A small wooden box.";
	 obj.set(game.attrs.OPENABLE, true);
	 obj.set(game.attrs.OPEN, false);
	 obj.set(game.attrs.CONTAINER, true);
     });
    game.objs.smallBox.moveTo(game.objs.startRoom);
    
    game.player.moveTo(game.objs.startRoom);

    console.log("Room 101 parent is: " + game.objs.startRoom.parent);
}
