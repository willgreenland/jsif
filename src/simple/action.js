
var jsif = (typeof window === 'undefined' ? global.jsif : window.jsif);


jsif.addBasicActions = function(game) {
    
    // ask
    game.createAskAction = function(o, g, actor) {
	let a = game.createAction(actor, 'ask');
	a.actionName = 'ask';
	a.target1 = o.getObject(1);
	a.target2 = o.getObject(2);
	a.execute = function(p) {
	    // "There is no reply."
	    g.lang.MSG_ASK_NO_REPLY(p, g, this);
	};
	return a;
    };

    // attack
    game.createAttackAction = function(o, g, actor) {
	let a = game.createAction(actor);
	a.actionName = 'attack';
	a.target = o.getObject(1);
	a.weapon = o.getObject(2);
	a.execute = function(p) {
	    // "Violence isn't the answer to this one."
	    g.lang.MSG_ATTACK_REFUSE(p);
	};
	return a;
    };
    
    // climb

    // close
    game.createCloseAction = function(o, g, actor) {
	let a = game.createAction(actor);
	a.actionName = 'close';
	a.target1 = o.getObject(1);
	a.execute = function(p) {
	    if (this.target1.get(game.attrs.OPENABLE)) {
		if (this.target1.get(game.attrs.OPEN)) {
		    this.target1.set(game.attrs.OPEN, false);
		    g.lang.MSG_CLOSE_SUCCESS(p, g, this);
		}
		else {
		    g.lang.MSG_CLOSE_FAIL_ALREADY_CLOSED(p, g, this);
		}
	    }
	    else {
		g.lang.MSG_CLOSE_FAIL_NOT_CLOSABLE(p, g, this);
	    }
	};
	return a;
    };

    // drink
    game.createDrinkAction = function(o, g, actor) {
	let a = game.createAction(actor);
	a.actionName = 'drink';
	a.target1 = o.getObject(1);
	a.execute = function(p) {
	    g.lang.MSG_DRINK_REFUSE(p, g, this);
	};
	return a;
    };

    // drop
    game.createDropAction = function(o, g, actor) {
	let a = game.createAction(actor);
	a.actionName = 'drop';
	a.target1 = o.getObject(1);
	a.execute = function(p) {
	    if (this.target1 != g.player &&
		this.target1.hasAncestor(g.player)) {
		this.target1.moveTo(g.player.getReachableCeiling());
		g.lang.MSG_DROP_SUCCESS(p, g, this);
	    }
	    else {
		g.lang.MSG_DROP_FAIL_NOT_HELD(p, g, this);
	    }
	};
	return a;
    };

    // eat
    game.createEatAction = function(o, g, actor) {
	let a = game.createAction(actor);
	a.actionName = 'eat';
	a.target1 = o.getObject(1);
	a.execute = function(p) {
	    if (this.target1.get(g.attrs.EDIBLE)) {
		this.target1.remove();
		g.lang.MSG_EAT_SUCCESS(p, g, this);
	    }
	    else {
		g.lang.MSG_EAT_REFUSE(p, g, this);
	    }
	};
	return a;
    };

    
    // examine
    game.createExamineAction = function(o, g, actor) {
	let a = game.createAction(actor);
	a.actionName = 'examine';
	a.target1 = o.getObject(1);
	a.execute = function(p) {
	    this.target1.describe(p);
	};
	return a;
    };
    
    // get/take
    game.createGetAction = function(o, g, actor) {
	let a = game.createAction(actor);
	a.actionName = 'get';
	a.target1 = o.getObject(1);
	a.execute = function(p) {
	    var par = game.player;
	    var loc = game.player.getLocation();
	    var result = this.target1.isReachableFrom(par, loc, null);
	    
	    if (this.target1 == game.player ||
		this.target1.parent == this.actor) {
		game.lang.MSG_GET_FAIL_HELD(p, g, this);
	    }
	    else if (!result.val) {
		p.print(result.msg);
	    }
	    else if (this.target1.get(game.attrs.SCENERY)) {
		game.lang.MSG_GET_FAIL_SCENERY(p, g, this);
	    }
	    else if (this.target1.get(game.attrs.STATIC)) {
		game.lang.MSG_GET_FAIL_STATIC(p, g, this);
	    }

	    else if (this.target1.get(game.attrs.ANIMATE)) {
		game.lang.MSG_GET_FAIL_ANIMATE(p, g, this);
	    }
	    else {
		this.target1.moveTo(game.player);
		game.lang.MSG_GET_SUCCESS(p, g, this);
	    }
	};
	return a;
    };

    // go
    game.createGoAction = function(o, g, actor) {
	let a = game.createAction(actor);
	a.dir = o.getObject(1);
	
	a.execute = function(p) {
	    var loc = this.actor.getLocationForMove(this.dir);
	    var portal = loc.getPortal(this.dir);
	    var dest = null;
	    var needFailMsg = true;
	    if (portal != null) {
		if (portal.allowPassage(p)) {
		    dest = loc.getPortalDest(this.dir, game);
		}
		else {
		    needFailMsg = false;
		}
	    }
	    else {
		dest = loc.getDestination(this.dir, game);
	    }
	    if (dest != null) {
		if ((typeof dest) === 'function') {
		    dest = dest();
		}
		var par = this.actor.parent;
		var result = dest.isReachableFrom(par, loc, this.dir);
		if (result.val) {
		    this.actor.moveTo(dest);
		    this.actor.getLocation().describeAsRoom(p);
		}
		else {
		    p.print(result.msg);
		}
	    }
	    else {
		if (needFailMsg) {
		    game.lang.MSG_GO_FAIL_CANT_GO(p, g, this);
		}
	    }
	};
	return a;
    };

    // insert ("put x in y")
    game.createInsertAction = function(o, g, actor) {
	let a = game.createAction(actor);
	a.actionName = 'insert';
	a.target1 = o.getObject(1);
	a.target2 = o.getObject(2);
	a.execute = function(p) {
	    if (this.target1.parent != a.actor) {
		g.lang.MSG_INSERT_FAIL_NOT_HELD(p, g, this);
	    }
	    else if (!this.target2.get(g.attrs.CONTAINER)) {
		g.lang.MSG_INSERT_FAIL_NOT_CONTAINER(p, g, this);
	    }
	    else if (this.target2.get(g.attrs.OPENABLE) &&
		     !this.target2.get(g.attrs.OPEN)) {
		g.lang.MSG_INSERT_FAIL_NOT_OPEN(p, g, this);
	    }
	    else {
		this.target1.moveTo(this.target2);
		g.lang.MSG_INSERT_SUCCESS(p, g, this);
	    }
	};
	return a;
    };
    
    // inventory
    game.createInventoryAction = function(o, g, actor) {
	let a = game.createAction(actor);
	a.actionName = 'inventory';
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
	return a;
    };
    
    
    // look
    game.createLookAction = function(o, g, actor) {
	let a = game.createAction(actor);
	a.actionName = 'look';
	a.execute = function(p) {
	    // FIXME w/ actor
	    game.player.getLocation().describeAsRoom(p);
	};
	return a;
    };

    // open
    game.createOpenAction = function(o, g, actor) {
	let a = game.createAction(actor);
	a.actionName = 'open';
	a.target1 = o.getObject(1);
	a.execute = function(p) {
	    if (this.target1.get(game.attrs.OPENABLE)) {
		if (this.target1.get(game.attrs.OPEN)) {
		    g.lang.MSG_OPEN_FAIL_ALREADY_OPEN(p, g, this);
		}
		else {
		    this.target1.set(game.attrs.OPEN, true);
		    g.lang.MSG_OPEN_SUCCESS(p, g, this);
		}
	    }
	    else {
		g.lang.MSG_OPEN_FAIL_NOT_OPENABLE(p, g, this);
	    }
	};
	return a;
    };

    // push
    
    game.createPushAction = function(o, g, actor) {
	let a = game.createAction(actor, 'push');
	a.actionName = 'push';
	a.target1 = o.getObject(1);
	a.execute = function(p) {
	    g.lang.MSG_PUSH_FAIL_NO_RESULT(p, g, this);
	};
	
	return a;
    };

    // wait

    game.createWaitAction = function(o, g, actor) {
	let a = game.createAction(actor, 'wait');
	a.actionName = 'wait';
	a.execute = function(p) {
	    g.lang.MSG_WAIT(p, g, this);
	}
	return a;
    }
};
