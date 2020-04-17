
var jsif = (typeof window === 'undefined' ? global.jsif : window.jsif);

jsif.createGame = function(flags) {

    var game = {};
    
    game.parser = jsif.createParser(game);
    
    game.handleInput = function(input, clientWrapper) {
	var result = this.parser.parse(input, this);
	if (result.clear.length == 1) {
	    var action = result.clear[0];
	    var stop = action.actor.orders(action, clientWrapper);
;
	    if (!stop && action.target1 != undefined) {
		stop = 
		    action.target1.beforeHandler(action.verb, 1,
						 clientWrapper,
						 action.target2);
		// fixme: need target2 beforeHandler, and reactBefore
	    }
	    if (stop) {
		// return;
	    }
	    else {
		action.execute(clientWrapper);
	    }
	}
	else if (result.ambiguous.length > 0) {
	    clientWrapper.print(result.ambiguous[0]);
	}
	else if (result.noSuchThing.length > 0) {
	    clientWrapper.print(result.noSuchThing[0]);
	}
	else {
	    clientWrapper.print("I don't understand.");
	}

	let rec = function(obj) {
	    obj.daemon(clientWrapper);
	    for (var i = 0; i < obj.children.length; i++) {
		rec(obj.children[i]);
	    }
	};

	rec(game.getPlayer().getLocation());
    };

    game.world = jsif.createWorld(game);

    game.topics = game.world.create('topics', 'topics', null);
    
    game.compass = game.world.create('compass', 'compass', null);

    if (flags.addEnglishDirections) {
	jsif.addEnglishDirections(game.compass, game.world);
    }

    game.createAction = function(actor, verb) {
	var action = {};
	action.actor = actor ? actor : game.player;
	action.verb = verb;
	return action;
    };
    
    game.lang = {};

    jsif.addBasicActions(game);

    jsif.addEnglishVerbs2(game, game.parser);

    jsif.addEnglishMessages(game);
    
    game.objs = {};

    game.attrs = {};

    if (flags.defaultAttrs) {
	jsif.addDefaultAttrs(game);
    }

    if (flags.defaultPlayer) {
	game.player = game.world.create("yourself", "me", (obj) => {
	    obj.description = "Handsome as ever.";
	});
    }

    game.getPlayer = function() { return this.player; };
    
    return game;
    
};

jsif.createBasicGame = function() {
    var flags = {};
    flags.defaultAttrs = true;
    flags.defaultPlayer = true;
    flags.addEnglishDirections = true;
    return jsif.createGame(flags);
};

jsif.addDefaultAttrs = function(game) {
    game.attrs.OPEN = 1;
    game.attrs.OPENABLE = 2;
    game.attrs.LOCKED = 3;
    game.attrs.LOCKABLE = 4;
    game.attrs.PROPER = 5;
    game.attrs.LOCKED = 6;
    game.attrs.LOCKABLE = 7;
    game.attrs.KEY = 8;
    game.attrs.SCENERY = 9;
    game.attrs.STATIC = 10;
    game.attrs.ANIMATE = 11;
    game.attrs.SUPPORTER = 12;
    game.attrs.ENTERABLE = 13;
    game.attrs.CONTAINER = 14;
    game.attrs.TRANSPARENT = 15;
    game.attrs.EDIBLE = 16;
    game.attrs.LIT = 17;
};

