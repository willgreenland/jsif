
var jsif = (typeof window === 'undefined' ? global.jsif : window.jsif);


jsif.createWorld = function(game) {

    var world = {};
    world.game = game;
    world.create = function(name, names, f) {
	var obj = {};

	obj.game = game;
	
	obj.name = name;
	obj.names = names.split(' ');

	obj.parent = null;
	obj.children = [];
	obj.attrKeys = [];
	obj.attrVals = [];
	
	
	obj.setNames = function(str) {
	    this.names = str.split(' ');
	};
	
	obj.consumeWords = function(tokens, start) {
	    //console.log('consuming words from obj: ' + this.name);
	    var pos = start;
	    var matching = true;
	    while (matching && pos < tokens.length) {
		var seeking = true;
		var i = 0;
		while (seeking && i < this.names.length) {
		    if (this.names[i] == tokens[pos]) {
			seeking = false;
		    }
		    i++;
		}
		if (!seeking) { pos++; }
		matching = !seeking;
	    }
	    //console.log('matching length: ' + (pos - start));
	    return (pos - start);
	};
	
	obj.getScope = function() {
	    var ceiling = this.getVisibleCeiling();
	    var scope = [];
	    ceiling.addToScope(scope, true, true);
	    for (var i = 0; i < ceiling.portals.length; i++) {
		ceiling.portals[i].addToScope(scope, true, false);
	    }
	    return scope;
	};
	
	obj.getVisibleCeiling = function() {
	    if (this.parent != null &&
		(this.get(this.game.attrs.TRANSPARENT) ||
		 this.get(this.game.attrs.SUPPORTER) ||
		 this.get(this.game.attrs.OPEN))) {
		return this.parent.getVisibleCeiling();
	    }
	    else {
		return this;
	    }
	};

	obj.getReachableCeiling = function() {
	    let c = null;
	    if (obj.parent != null &&
		!obj.get(obj.game.attrs.ENTERABLE) &&
		(obj.get(obj.game.attrs.OPEN) ||
		 !obj.get(obj.game.attrs.OPENABLE))) {
		c = obj.parent.getReachableCeiling();
	    }
	    else {
		c = obj;
	    }
	    return c;
	};

	obj.isReachableFromCeiling = function(loc) {
	    var result = {};
	    result.val = false;
	    if (this.isPortalOf(loc)) {
		result.val = true;
		return result;
	    }
	    let par = this.parent;
	    while (par != null) {
		if (par.get(this.game.attrs.OPENABLE) &&
		    !par.get(this.game.attrs.OPEN)) {
		    result.msg = "You'll need to open " +
			par.getName(this.game.lang.DEF) +
			" first.";
		    return result;
		}
		else if (par == loc) {
		    result.val = true;
		    return result;
		}
		par = par.parent;
	    }
	    result.msg = "You can't reach that from here.";
	    return result;

	};
	
	obj.getLocationForMove = function(dir) {
	    return this.parent.getVisibleCeiling();
	};
	
	obj.getPortal = function(dir) {
	    return null;
	};
	
	obj.dirs = [];
	obj.dests = [];
	
	obj.setDestination = function(dir, dest) {
	    var add = true;
	    for (var i = 0; i < this.dirs.length; i++) {
		if (this.dirs[i] == dir) {
		    this.dests[i] = dest;
		    add = false;
		}
	    }
	    if (add) {
		this.dirs.push(dir);
		this.dests.push(dest);
	    }
	};
	
	obj.getDestination = function(dir, game) {
	    //console.log('getDestination: ' + dir.name);
	    for (var i = 0; i < this.dirs.length; i++) {
		//console.log('checking against: ' + this.dirs[i].name);
		if (this.dirs[i] == dir) {
		    return this.dests[i];
		}
	    }
	    if (dir.get(game.attrs.ENTERABLE)) {
		return dir;
	    }
	    if (dir == game.compass.O &&
		game.player.parent.get(game.attrs.ENTERABLE)) {
		return game.player.parent.parent;
	    }
	    return null;
	};
	
	obj.portals = [];
	obj.portalDirs = [];
	obj.portalDests = [];

	obj.isPortalOf = function(loc) {
	    for (let i = 0; i < loc.portals.length; i++) {
		if (loc.portals[i] == this) {
		    return true;
		}
	    }
	    return false;
	};
	
	obj.getPortal = function(dir) {
	    for (var i = 0; i < this.portalDirs.length; i++) {
		if (this.portalDirs[i] == dir) {
		    return this.portals[i];
		}
	    }
	    return null;
	};
	
	obj.getPortalDest = function(dir, game) {
	    for (var i = 0; i < this.portalDirs.length; i++) {
		if (this.portalDirs[i] == dir) {
		    return this.portalDests[i];
		}
	    }
	    return null;
	};
	
	obj.setPortal = function(portal, dir, dest) {
	    var add = true;
	    for (var i = 0; i < this.portalDirs.length; i++) {
		if (this.portalDirs[i] == dir) {
		    this.portals[i] = portal;
		    this.portalDirs[i] = dir;
		    this.portalDests[i] = dest;
		    add = false;
		}
	    }
	    if (add) {
		this.portals.push(portal);
		this.portalDirs.push(dir);
		this.portalDests.push(dest);
	    }
	};
	
	obj.allowPassage = function(p) {
	    //p.print("Passing through " + this.getName(game.lang.DEF) + "...");
	    var open = this.get(game.attrs.OPEN);
	    if (open == null) {
		return true;
	    }
	    if (open) {
		return true;
	    }
	    p.print("You can't, because " + this.getName(game.lang.DEF) +
		    " is in the way.");
	    return false;
	};
	
	obj.addToScope = function(scope, recursive, first) {
	    scope.push(this);
	    if (recursive) {
		//console.log('recursing addToScope for: ' + this.name);
		if (first ||
		    this == this.game.player ||
		    this.get(this.game.attrs.TRANSPARENT) ||
		    this.get(this.game.attrs.SUPPORTER) ||
		    (this.get(this.game.attrs.OPENABLE) &&
		     this.get(this.game.attrs.OPEN))) {
		    for (var i = 0; i < this.children.length; i++) {
			this.children[i].addToScope(scope, recursive, false);
		    }
		}
	    }
	};
	
	obj.setParent = function(par) {
	    this.parent = par;
	};
	
	obj.hasAncestor = function(anc) {
	    if (this == anc) {
		return true;
	    }
	    else if (this.parent == null) {
		return false;
	    }
	    else return this.parent.hasAncestor(anc);
	};
	
	obj.addChild = function(child) {
	    var needed = true;
	    for (var c in this.children) {
		if (c == child) {
		    needed = false;
		}
	    }
	    if (needed) {
		this.children.push(child);
	    }
	};
	
	obj.removeChild = function(child) {
	    var newChildren = [];
	    for (var i = 0; i < this.children.length; i++) {
		var c = this.children[i];
		if (c != child) {
		    newChildren.push(c);
		}
	    }
	    this.children = newChildren;
	};
	
	obj.moveTo = function(newPar) {
	    if (this.parent != null) {
		this.parent.removeChild(this);
	    }
	    this.parent = newPar;
	    if (this.parent != null) {
		newPar.addChild(this);
	    }
	};
	
	obj.remove = function() {
	    this.moveTo(null);
	};
	
	obj.get = function(attr) {
	    for (var i = 0; i < this.attrKeys.length; i++) {
		if (this.attrKeys[i] == attr) {
		    return this.attrVals[i];
		}
	    }
	    return null;
	};
	
	obj.set = function(attr, val) {
	    var add = true;
	    for (var i = 0; i < this.attrKeys.length; i++) {
		if (this.attrKeys[i] == attr) {
		    this.attrVals[i] = val;
		    add = false;
		}
	    }
	    if (add) {
		this.attrKeys.push(attr);
		this.attrVals.push(val);
	    }
	    
	};
	
	obj.beforeHandler = function(verb, pos, p, second) {
	    return false;
	};
	
	obj.before = function(verb, pos, handler) {
	    var oldHandler = this.beforeHandler;
	    this.beforeHandler = function(verb2, pos2, p, second) {
		console.log("beforeHandler: " + pos + ", " + pos2);
		console.log(verb);
		console.log(verb2);
		if (verb == verb2 && pos == pos2) {
		    console.log('matched verb and pos');
		    return handler(p, second);
		}
		else {
		    return oldHandler(verb2, pos2, p, second);
		}
	    };
	};
	
	obj.getLocation = function() {
	    return this.parent.getVisibleCeiling();
	};

	// FIXME: move to language
	obj.getPrepSubject = function(cap) {
	    if (obj.get(game.attrs.ANIMATE)) {
		if (obj.get(game.attrs.FEMALE)) {
		    return cap ? "She" : "she";
		}
		else {
		    return cap ? "He" : "he";
		}
	    }
	    else {
		return cap ? "It" : "it";
	    }
	};

	obj.getPrepObject = function(cap) {
	    if (obj.get(game.attrs.ANIMATE)) {
		if (obj.get(game.attrs.FEMALE)) {
		    return cap ? "Her" : "her";
		}
		else {
		    return cap ? "Him" : "him";
		}
	    }
	    else {
		return cap ? "It" : "it";
	    }
	};

	obj.getPossessive = function(cap) {
	    if (obj.get(game.attrs.ANIMATE)) {
		if (obj.get(game.attrs.FEMALE)) {
		    return cap ? "Her" : "her";
		}
		else {
		    return cap ? "His" : "his";
		}
	    }
	    else {
		return cap ? "Its" : "its";
	    }
	};

	obj.getName = function(article, cap) {
	    var word;
	    if (this.get(game.attrs.PROPER)) {
		return this.name;
	    }
	    if (article == game.lang.DEF) {
		if (cap) { word = 'The'; } else { word = 'the'; }
	    }
	    else if (article == game.lang.UNDEF) {
		if (cap) { word = 'A'; } else { word = 'a'; }
	    }
	    return word + ' ' + this.name;
	};
	
	obj.describe = function(out) {
	    var text = '';
	    if (this.description != null) {
		text = this.description;
	    }
	    else {
		text = 'Nothing special.';
	    }
	    var listChildren = false;
	    if (this.get(game.attrs.SUPPORTER) && this.children.length > 0) {
		listChildren = true;
		text = text + " On " + this.getName(game.lang.DEF) +
		    " you can see ";
	    }
	    else if (this.get(game.attrs.CONTAINER) &&
		     (this.get(game.attrs.OPEN) ||
		      !this.get(game.attrs.OPENABLE)) &&
		     this.children.length > 0) {
		listChildren = true;
		text = text + " " + this.getName(game.lang.DEF, true) +
		    " contains ";
	    }
	    if (listChildren) {
		for (var i = 0; i < this.children.length; i++) {
		    text = text + this.children[i].getName(game.lang.UNDEF);
		    if (i < this.children.length - 2) {
			text = text + ", ";
		    }
		    else if (i < this.children.length - 1) {
			text = text + " and ";
		    }
		    else {
			text = text + ".";
		    }
		}
	    }
	    out.print(text);
	};

	obj.hasLightInside = function() {
	    // an object has light inside if it is LIT_INSIDE itself,
	    // or if any of its visible descendents "provides light"
	    if (this.get(game.attrs.LIT_INSIDE)) {
		return true;
	    }
	    for (var i = 0; i < this.children.length; i++) {
		if (this.children[i].providesLight()) {
		    return true;
		}
	    }
	    return false;
	};

	obj.providesLight = function() {
	    if (this.get(game.attrs.LIT)) {
		return true;
	    }
	    if (this.get(game.attrs.TRANSPARENT) ||
		this.get(game.attrs.SUPPORTER)) {
		for (var i = 0; i < this.children.length; i++) {
		    if (this.children[i].providesLight()) {
			return true;
		    }
		}
	    }
	    return false;
	};

	obj.isReachableFrom = function(par, loc, dir) {
	    var result = {};
	    result.val = false;

	    console.log("obj: " + this.name);
	    console.log("par: " + par.name);
	    console.log("loc: " + loc.name);
	    console.log("dir: " + (dir ? dir.name : "NULL"));
	    
	    if (dir && dir.parent == this.game.compass) {
		console.log('dir in compass');
	    }
	    else {
		console.log('dir not in compass');
	    }
	    
	    if (par == loc && dir != null &&
		dir != this.game.compass.I &&
		dir != this.game.compass.O &&
		dir.parent == this.game.compass) {
		result.val = true;
		return result;
	    }
	    else if (this == par.parent && dir == this.game.compass.O) {
		result.val = true;
		return result;
	    }
	    else {
		let objReach = obj.getReachableCeiling();
		let parReach = par.getReachableCeiling();

		if (objReach == parReach) {
		    result.val = true;
		    return result;
		}
		else if (parReach.hasAncestor(objReach)) {
		    result.val = false;
		    result.msg = "You'll need to ";
		    if (parReach.get(this.game.attrs.SUPPORTER)) {
			result.msg += "get off ";
		    }
		    else {
			result.msg += "leave ";
		    }
		    result.msg += parReach.getName(this.game.lang.DEF);
		    result.msg += " first.";
		    return result;
		}
		else {
		    return obj.isReachableFromCeiling(parReach);
		}
	    }
	};
	
	obj.describeAsRoom = function(out) {
	    var shortDesc =
		this.nameAsLocation ? this.nameAsLocation : this.name;
	    if (this != game.player.parent) {
		var prep = game.player.parent.get(game.attrs.SUPPORTER) ?
		    'on' : 'in';
		shortDesc = shortDesc + " (" + prep + " " +
		    game.player.parent.getName(game.lang.DEF) +
		    ")";
	    }
	    out.print(shortDesc);

	    if (this.hasLightInside()) {
		if (this.description != null) {
		    out.print(this.description);
		}
		else {
		    //out.print("There is nothing special about where you are.");
		}
		var scope = [];
		this.addToScope(scope, true, true);
		var ofInt = [];
		
		for (var i = 0; i < scope.length; i++) {
		    var obj = scope[i];
		    if (!obj.hasAncestor(game.player) && obj != this &&
			!obj.get(game.attrs.SCENERY)) {
			ofInt.push(obj);
		    }
		}
		if (ofInt.length > 0) {
		    var outStr = "You can see ";
		    for (var i = 0; i < ofInt.length; i++) {
			outStr = outStr + ofInt[i].getName(game.lang.UNDEF);
			if (i < ofInt.length - 2) {
			    outStr = outStr + ", ";
			}
			else if (i < ofInt.length - 1) {
			    outStr = outStr + " and ";
			}
		    }
		    out.print(outStr + " here.");
		    
		}
		
	    }
	    else {
		out.print("It is pitch dark, and you can't see a thing.");
	    }

		
	    
	};
	
	obj.describeAfterMove = function(p) {
	    this.describeAsRoom(p);
	};

	obj.orders = function(action, p) {
	    if (obj.get(game.attrs.ANIMATE)) {
		p.print("There is no reply.");
		return true;
	    }
	    else if (obj == game.getPlayer()) {
		return false;
	    }
	    else {
		p.print("Your command is met with silence.");
		return true;
	    }
	};

	obj.addOrders = function(f) {
	    let oldOrders = obj.orders;
	    obj.orders = function(a2, p2) {
		let res = f(a2, p2);
		if (res) { return res; }
		else { return oldOrders(a2, p2); }
	    };
	}

	obj.daemon = function(p) {
	    return false;
	};
	
	obj.getScore = function(verb) {
	    if (verb == game.lang.DROP && this.parent == jsif.player) {
		return 100;
	    }
	    else {
		return 1;
	    }
	};
	
	if (f) {
	    f(obj);
	}
	
	return obj;
    };
    
    return world;
};
