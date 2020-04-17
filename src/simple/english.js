
var jsif = (typeof window === 'undefined' ? global.jsif : window.jsif);


jsif.addEnglishVerbs2 = function(game, parser) {

    // ask
    game.lang.ASK = jsif.createVerb();

    parser.addPattern('ask <noun> about <scope=topics>', game.lang.ASK,
		      game.createAskAction);
    
    // attack
    game.lang.ATTACK = jsif.createVerb();

    parser.addPattern('attack <noun>', game.lang.ATTACK,
		      game.createAttackAction);

    // close
    game.lang.CLOSE = jsif.createVerb();

    parser.addPattern('close <noun>', game.lang.CLOSE,
		      game.createCloseAction);

    // drink
    game.lang.DRINK = jsif.createVerb();

    parser.addPattern('drink <noun>', game.lang.DRINK,
		      game.createDrinkAction);
    
    // drop
    game.lang.DROP = jsif.createVerb();
    
    parser.addPattern('drop <noun>', game.lang.DROP,
		      game.createDropAction);


    // eat
    game.lang.EAT = jsif.createVerb();

    parser.addPattern('eat <noun>', game.lang.EAT, game.createEatAction);
    
    
    // enter
    game.lang.ENTER = jsif.createVerb();

    parser.addPattern('enter <noun>', game.lang.ENTER, game.createGoAction);
    
    // examine
    game.lang.EXAMINE = jsif.createVerb();

    parser.addPattern('x|exa|examine <noun>', game.lang.EXAMINE,
		      game.createExamineAction);

    
    // get/take
    game.lang.GET = jsif.createVerb();

    parser.addPattern('get <noun>', game.lang.GET, game.createGetAction);

    // go
    game.lang.GO = jsif.createVerb();

    parser.addPattern('go <dir>', game.lang.GO, game.createGoAction);
    parser.addPattern('<dir>', game.lang.GO, game.createGoAction, true);

    // insert
    game.lang.INSERT = jsif.createVerb();

    parser.addPattern('insert <noun> into <noun>', game.lang.INSERT,
		      game.createInsertAction);
    parser.addPattern('put <noun> in <noun>', game.lang.INSERT,
		      game.createInsertAction);
    
    // inventory
    game.lang.INVENTORY = jsif.createVerb();

    parser.addPattern('i|inv|inventory', game.lang.INVENTORY,
		      game.createInventoryAction);
    
    // look
    game.lang.LOOK = jsif.createVerb();

    parser.addPattern('l|look', game.lang.LOOK, game.createLookAction);


    // open
    game.lang.OPEN = jsif.createVerb();

    parser.addPattern('open <noun>', game.lang.OPEN, game.createOpenAction);

    // push
    game.lang.PUSH = jsif.createVerb();

    parser.addPattern('push <noun>', game.lang.PUSH, game.createPushAction);

    // wait
    game.lang.WAIT = jsif.createVerb();

    parser.addPattern('z|wait', game.lang.WAIT, game.createWaitAction);
};

jsif.addEnglishVerbs = function(game, parser) {

    // ask
    game.lang.ASK = jsif.createVerb();

    parser.addPattern('ask <noun> about <scope=topics>', game.lang.ASK,
		 function(a, o) {
	a.verb = 'ask';
	a.target1 = o.getObject(1);
	a.target2 = o.getObject(2);
	a.execute = function(p) {
	    p.print('There is no reply.');
	};
    });

    // attack
    game.lang.ATTACK = jsif.createVerb();

    // climb
    game.lang.CLIMB = jsif.createVerb();
    
    // close
    game.lang.CLOSE = jsif.createVerb();

    parser.addPattern('close <noun>', game.lang.CLOSE, function(a, o) {
	a.verb = 'close';
	a.target1 = o.getObject(1);
	a.execute = function(p) {
	    if (this.target1.get(game.attrs.OPENABLE)) {
		if (this.target1.get(game.attrs.OPEN)) {
		    this.target1.set(game.attrs.OPEN, false);
		    p.print("You close " + this.target1.getName(game.lang.DEF)
			    + ".");
		}
		else {
		    p.print(this.target1.getName(game.lang.DEF, true) +
			    " is already closed!");
		}
	    }
	    else {
		p.print("That's not something you can close.");
	    }
	};
    });

    // drink
    game.lang.DRINK = jsif.createVerb();

    // drop
    game.lang.DROP = jsif.createVerb();
    
    parser.addPattern('drop <noun>', game.lang.DROP, function(a, o) {
	a.verb = 'drop';
	a.target = o.getObject(1);
	a.execute = function(p) {
	    this.target.moveTo(this.actor.getLocation());
	    p.print('You drop ' + this.target.getName(game.lang.DEF) + '.');
	};
    });

    // eat
    game.lang.EAT = jsif.createVerb();
    
    // enter
    game.lang.ENTER = jsif.createVerb();

    
    // examine
    game.lang.EXAMINE = jsif.createVerb();
    
    parser.addPattern('x|ex|exa|examine <noun>', game.lang.EXAMINE, function(a, o) {
	a.verb = 'examine';
	a.target1 = o.getObject(1);
	a.execute = function(p) {
	    this.target1.describe(p);
	};
    });

    // fill
    game.lang.FILL = jsif.createVerb();

    // get
    game.lang.GET = jsif.createVerb();
    
    parser.addPattern('g|get|t|take <noun>', game.lang.GET, function(a, o) {
	a.verb = 'get';
	a.target = o.getObject(1);
	console.log('target of get: ' + a.target);
	a.execute = function(p) {
	    if (this.target.get(game.attrs.ANIMATE)) {
		p.print("I don't think " + this.target.getName(game.lang.DEF) +
			" would like that.");
	    }
	    else if (this.target.get(game.attrs.SCENERY)) {
		p.print("That's hardly portable.");
	    }
	    else if (this.target.get(game.attrs.STATIC)) {
		p.print("That's fixed in place.");
	    }
	    else {
		this.target.moveTo(this.actor);
		p.print("You take " + this.target.getName(game.lang.DEF));
	    }
	};
    });

    // give
    game.lang.GIVE = jsif.createVerb();
    game.lang.GIVEN_TO = jsif.createVerb();

    parser.addPattern('give <noun> to <noun>', game.lang.GIVE, function(a, o) {
	a.verb = 'give';
	a.target1 = o.getObject(1);
	a.target2 = o.getObject(2);
	a.execute = function(p) {
	    p.print(this.target2.getName(game.lang.DEF, true) +
		    " doesn't seem all that interested.");
	};
    });

    // go (also: exit via "go out")
    game.lang.GO = jsif.createVerb();
    
    parser.addPattern('go <dir>', game.lang.GO, function(a, o) {
	return jsif.createGoAction(a, o.getObject(1));
    });

    parser.addPattern('<dir>', game.lang.GO, function(a, o) {
	return jsif.createGoAction(a, o.getObject(1));
    });

    parser.addPattern('exit', game.lang.GO, function(a, o) {
	return jsif.createGoAction(a, jsif.compass.O);
    });

    // insert (put in)
    game.lang.INSERT = jsif.createVerb();

    parser.addPattern('put <noun> in <noun>', game.lang.INSERT, function(a, o) {
	a.verb = 'insert';
	a.target1 = o.getObject(1);
	a.target2 = o.getObject(2);
	a.execute = function(p) {
	    // FIXME - do logic for insertion
	    p.print("You put " + this.target1.getName(game.lang.DEF) +
		    " in " + this.target2.getName(game.lang.DEF) + ".");
	};
    });
    
    // inventory
    game.lang.INVENTORY = jsif.createVerb();
    
    parser.addPattern('i|inv|inventory', game.lang.INVENTORY, function(a, o) {
	a.verb = 'inventory';
	a.execute = function(p) {
	    var str = "You are holding ";
	    if (this.actor.children.length == 0) {
		str = str + "nothing.";
	    }
	    else {
		for (var i = 0; i < this.actor.children.length; i++) {
		    var obj = this.actor.children[i];
		    str = str + obj.getName(game.lang.UNDEF);
		    if (i < this.actor.children.length - 2) {
			str = str + ", ";
		    }
		    else if (i < this.actor.children.length - 1) {
			str = str + " and ";
		    }
		    else {
			str = str + ".";
		    }
		}
	    }
	    p.print(str);
	};
    });

    // jump
    game.lang.JUMP = jsif.createVerb();
    game.lang.JUMP_OVER = jsif.createVerb();
    
    // listen
    game.lang.LISTEN = jsif.createVerb();
    
    // lock
    game.lang.LOCK = jsif.createVerb();
   
    parser.addPattern('lock <noun> with <noun>', game.lang.LOCK, function(a, o) {
	a.verb = 'lock';
	a.target1 = o.getObject(1);
	a.target2 = o.getObject(2);
	a.execute = function(p) {
	    if (!(this.target1.get(game.attrs.LOCKABLE))) {
		p.print("That's not something you can lock.");
	    }
	    else if (this.target1.get(game.attrs.LOCKED)) {
		p.print(this.target1.getName(game.lang.DEF, true) +
			' is already locked!');
	    }
	    else if (this.target1.get(game.attrs.OPEN)) {
		p.print("You should close " +
			this.target1.getName(game.lang.DEF) +
			" first.");
	    }
	    else if (this.target1.get(game.attrs.KEY) != this.target2) {
		p.print(this.target2.getName(game.lang.DEF, true) +
			" doesn't fit the lock!");
	    }
	    else {
		this.target1.set(game.attrs.LOCKED, true);
		p.print("Locked.");
	    }
	};
    });
    
    // look
    game.lang.LOOK = jsif.createVerb();
    
    parser.addPattern('l|look', game.lang.LOOK, function(a, o) {
	a.verb = 'look';
	a.execute = function(p) {
	    this.actor.getLocation().describeAsRoom(p);
	};
    });

    // open
    game.lang.OPEN = jsif.createVerb();

    parser.addPattern('o|open <noun>', game.lang.OPEN, function(a, o) {
	a.verb = 'open';
	a.target = o.getObject(1);
	a.execute = function(p) {
	    if (this.target.get(game.attrs.OPENABLE)) {
		if (this.target.get(game.attrs.OPEN)) {
		    p.print("But " + this.target.getName(game.lang.DEF) +
			    " is already open!");
		}
		else if (this.target.get(game.attrs.LOCKED)) {
		    p.print(this.target.getName(game.lang.DEF, true) +
			    " is locked.");
		}
		else {
		    this.target.set(game.attrs.OPEN, true);
		    p.print("You open " +
			    this.target.getName(game.lang.DEF) + ".");
		}
	    }
	    else {
		p.print("That's not something you can open.");
	    }
	};
    });

    // pull
    game.lang.PULL = jsif.createVerb();
    
    // push
    game.lang.PUSH = jsif.createVerb();
    
    // put on
    game.lang.PUT_ON = jsif.createVerb();

    parser.addPattern('put <noun> on <noun>', game.lang.PUT_ON, function(a, o) {
	a.verb = 'put_on';
	a.target1 = o.getObject(1);
	a.target2 = o.getObject(2);
	a.execute = function(p) {
	    if (this.target1.parent != this.actor) {
		p.print("You need to be holding " +
			this.target1.getName(game.lang.DEF) +
			" first.");
	    }
	    else if (!this.target2.get(game.attrs.SUPPORTER)) {
		p.print("That's not something you can put things on.");
	    }
	    else {
		this.target1.moveTo(this.target2);
		p.print("You put " + this.target1.getName(game.lang.DEF) +
			" on " + this.target2.getName(game.lang.DEF) + ".");
	    }
	};
    });
    
    // remove (take from, take off)
    game.lang.REMOVE = jsif.createVerb();

    // repeat
    game.lang.REPEAT = jsif.createVerb();

    jsif.createRepeat = function(a, o) {

    };
    
    // search (look in)
    game.lang.SEARCH = jsif.createVerb();

    jsif.createSearch = function(a, o) {
	a.verb = 'search';
	a.target1 = o.getObject(1);
	a.execute = function(p) {
	    p.print("You find nothing of interest.");
	};
    };
    
    parser.addPattern('search <noun>', game.lang.SEARCH, jsif.createSearch);
    parser.addPattern('look under <noun>', game.lang.SEARCH, jsif.createSearch);
    
    // switch on / switch off
    game.lang.SWITCH = jsif.createVerb();

    // taste
    game.lang.TASTE = jsif.createVerb();

    // tie
    game.lang.TIE = jsif.createVerb();
    
    // throw
    game.lang.THROW = jsif.createVerb();
    game.lang.THROW_AT = jsif.createVerb();
    game.lang.THROWN_AT = jsif.createVerb();
    
    // touch
    game.lang.TOUCH = jsif.createVerb();

    // turn
    game.lang.TURN = jsif.createVerb();
    
    // unlock
    game.lang.UNLOCK = jsif.createVerb();

    parser.addPattern
    ('unlock <noun> with <noun>', game.lang.UNLOCK, function(a, o) {
	a.verb = 'unlock';
	a.target1 = o.getObject(1);
	a.target2 = o.getObject(2);
	a.execute = function(p) {
	    if (!(this.target1.get(game.attrs.LOCKABLE))) {
		p.print("That's not something you can unlock.");
	    }
	    else if (!(this.target1.get(game.attrs.LOCKED))) {
		p.print(this.target1.getName(game.lang.DEF, true) +
			" is already unlocked.");
	    }
	    else if (this.target2 != this.target1.get(game.attrs.KEY)) {
		p.print(this.target2.getName(game.lang.DEF, true) +
			" doesn't fit the lock!");
	    }
	    else {
		this.target1.set(game.attrs.LOCKED, false);
		p.print("You unlock " + this.target1.getName(game.lang.DEF) +
			".");
	    }
	};
    });

    // wait
    game.lang.WAIT = jsif.createVerb();

    // wave
    game.lang.WAVE = jsif.createVerb();
    
    // wear
    game.lang.WEAR = jsif.createVerb();
    

};

jsif.createGoAction = function(a, dir) {
    a.verb = 'go';
    a.dir = dir;
    a.execute = function(p) {
	var loc = this.actor.getLocationForMove(this.dir);
	var portal = loc.getPortal(this.dir);
	var dest = null;
	if (portal != null) {
	    if (portal.allowPassage(p)) {
		dest = loc.getPortalDest(this.dir);
	    }
	}
	else {
	    dest = loc.getDestination(this.dir);
	}
	if (dest != null) {
	    if ((typeof dest) === 'function') {
		dest = dest();
	    }
	    this.actor.moveTo(dest);
	    dest.describeAfterMove(p);
	}
	else {
	    p.print("You can't go that way!");
	}
	
    };

    
};

jsif.addEnglishDirections = function(compass, world) {
    compass.N = world.create('north', 'n north', null);
    compass.N.moveTo(compass);
    compass.S = world.create('south', 's south', null);
    compass.S.moveTo(compass);
    compass.E = world.create('east', 'e east', null);
    compass.E.moveTo(compass);
    compass.W = world.create('west', 'w west', null);
    compass.W.moveTo(compass);
    compass.NE = world.create('northeast', 'ne northeast', null);
    compass.NE.moveTo(compass);
    compass.NW = world.create('northwest', 'nw northwest', null);
    compass.NW.moveTo(compass);
    compass.SE = world.create('southeast', 'se southeast', null);
    compass.SE.moveTo(compass);
    compass.SW = world.create('southwest', 'sw southwest', null);
    compass.SW.moveTo(compass);
    compass.U = world.create('up', 'u up', null);
    compass.U.moveTo(compass);
    compass.D = world.create('down', 'd down', null);
    compass.D.moveTo(compass);
    compass.I = world.create('in', 'in', null);
    compass.I.moveTo(compass);
    compass.O = world.create('out', 'out exit', null);
    compass.O.moveTo(compass);
}

jsif.addEnglishMessages = function(game) {

    game.lang.MSG_ASK_NO_REPLY = function(p, g, a) {
	p.print("There is no reply.");
    };

    game.lang.MSG_ATTACK_REFUSE = function(p, g, q) {
	p.print("Violence isn't the answer to this one.");
    };
    
    game.lang.MSG_CLOSE_SUCCESS = function(p, g, a) {
	// FIXME - deal with actor name
	p.print("You close " + a.target1.getName(g.lang.DEF)
		+ ".");
    };

    game.lang.MSG_CLOSE_FAIL_ALREADY_CLOSED = function(p, g, a) {
	p.print(a.target1.getName(g.lang.DEF, true) +
		" is already closed!");

    };

    game.lang.MSG_CLOSE_FAIL_NOT_CLOSABLE = function(p, g, a) {
	p.print("That's not something you can close.");
    };

    game.lang.MSG_DRINK_REFUSE = function(p, g, a) {
	p.print("You don't feel thirsty enough to try that.");
    };

    game.lang.MSG_DROP_SUCCESS = function(p, g, a) {
	p.print("Dropped.");
    };

    game.lang.MSG_DROP_FAIL_NOT_HELD = function(p, g, a) {
	p.print("But you're not holding " +
		a.target1.getName(g.lang.DEF) + "!");
    };

    game.lang.MSG_EAT_SUCCESS = function(p, g, a) {
	p.print("You eat " + a.target1.getName(g.lang.DEF) + ".");
    };
    
    game.lang.MSG_EAT_REFUSE = function(p, g, a) {
	p.print("That doesn't look very appetizing.");
    };

    game.lang.MSG_GET_SUCCESS = function(p, g, a) {
	p.print("Taken.");
    };

    game.lang.MSG_GET_FAIL_HELD = function(p, g, a) {
	p.print("But you're already holding " +
		a.target1.getName(g.lang.DEF) + "!");
    };

    game.lang.MSG_GET_FAIL_ANIMATE = function(p, g, a) {
	p.print("I don't think " + a.target1.getName(g.lang.DEF) +
		" would like that.");
    };

    game.lang.MSG_GET_FAIL_SCENERY = function(p, g, a) {
	p.print("That's hardly portable.");
    };

    game.lang.MSG_GET_FAIL_STATIC = function(p, g, a) {
	p.print("That's fixed in place.");
    };
    
    game.lang.MSG_GO_FAIL_CANT_GO = function(p, g, a) {
	p.print("You can't go that way!");
    }

    game.lang.MSG_GO_FAIL_EXIT_FIRST = function(p, g, a, obj) {
	var msg = "You'll have to ";
	if (obj.get(g.attrs.SUPPORTER)) {
	    msg += "get off ";
	}
	else {
	    msg += "get out of ";
	}
	msg += obj.getName(g.lang.DEF);
	msg += " first.";
	p.print(msg);
    }

    game.lang.MSG_INSERT_FAIL_NOT_HELD = function(p, g, a) {
	p.print("You need to be holding " +
		a.target1.getName(g.lang.DEF) + " first.");
    };

    game.lang.MSG_INSERT_FAIL_NOT_CONTAINER = function(p ,g, a) {
	p.print("That's not something you can put things in.");
    };

    game.lang.MSG_INSERT_FAIL_NOT_OPEN = function(p, g, a) {
	p.print("You need to open " +
		a.target2.getName(g.lang.DEF) + " first.");
    };

    game.lang.MSG_INSERT_SUCCESS = function(p, g, a) {
	p.print("You put " + a.target1.getName(g.lang.DEF) +
		" in " + a.target2.getName(g.lang.DEF) + ".");
    };
    
    game.lang.MSG_OPEN_SUCCESS = function(p, g, a) {
	p.print("You open " + a.target1.getName(g.lang.DEF) + ".");
    };

    game.lang.MSG_OPEN_FAIL_ALREADY_OPEN = function(p, g, a) {
	p.print(a.target1.getName(g.lang.DEF, true) +
		" is already optn!");
    };

    game.lang.MSG_OPEN_FAIL_NOT_OPENABLE = function(p, g, a) {
	p.print("That's not something you can open.");
    };

    game.lang.MSG_PUSH_FAIL_NO_RESULT = function(p, g, a) {
	p.print("This achieves nothing.");
    };

    game.lang.MSG_WAIT = function(p, g, a) {
	p.print("Time passes...");
    };
};
