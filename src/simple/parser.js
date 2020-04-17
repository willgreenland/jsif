
var jsif = (typeof window === 'undefined' ? global.jsif : window.jsif);

jsif.createParser = function(game) {

    let parser = {};
    parser.game = game;

    parser.rawPatterns = [];
    parser.patterns = [];
    parser.builders = [];

    parser.addPattern = function(pattern, verb, builder, preventNS) {
	this.rawPatterns.push(pattern);
	var p = this.createPattern(pattern);
	if (preventNS) {
	    p.preventNS = true;
	}
	else {
	    p.preventNS = false;
	}
	this.patterns.push(p);
	p.verb = verb;
	this.builders.push(builder);
    };

    parser.createPattern = function(p) {
	var blocks = [];
	var blockTokens = p.split(' ');
	for (var i = 0; i < blockTokens.length; i++) {
	    blocks.push(this.createBlock(blockTokens[i]));
	}
	return blocks;
    };

    parser.priorInput = null;
    
    parser.parse = function(input) {

	// fixme - add language options for repeating
	if (input == 'g') {
	    input = parser.priorInput;
	}
	else {
	    parser.priorInput = input;
	}
	
	// handle orders
	let orderPair = input.split(',');
	let actor = game.getPlayer();
	
	if (orderPair.length == 2) {

	    
	    let oScope = actor.getLocation().getScope();
	    let oMatches = [];
	    let oTokens = orderPair[0].trim().split(' ');
	    
	    for (let i = 0; i < oScope.length; i++) {
		let objN = oScope[i].consumeWords(oTokens, 0);
		if (objN == oTokens.length) {
		    oMatches.push(oScope[i]);
		}
	    }
	    if (oMatches.length > 0) {
		console.log("Identified actor: " + oMatches[0].name);
		actor = oMatches[0];
	    }
		
	    input = orderPair[1].trim();
	}
	
	let tokens = input.split(' ');
	let result = {};

	//result.clarity = 0; // "I don't understand."; goes up

	result.clear = [];
	result.ambiguous = [];
	result.noSuchThing = [];
	
	for (let i = 0; i < this.patterns.length; i++) {

	    var patternResult = this.matchPattern(this.patterns[i], tokens, actor, this.builders[i]);

	    if (patternResult.matched) {
		if (patternResult.noSuchThing) {
		    result.noSuchThing.push(patternResult.msg);
		}
		else if (patternResult.ambiguous) {
		    result.ambiguous.push(patternResult.msg);
		}
		else {
		    result.clear.push(patternResult.clear);
		}
	    }
	}
	
	return result;
    };

    parser.matchPattern = function(pattern, tokens, actor, builder) {
	let ppos = 0;
	let tpos = 0;
	let objs = [];
	let matching = true;

	let patternResult = {};

	patternResult.matched = false;
	patternResult.clear = null;
	patternResult.ambiguous = false;
	patternResult.noSuch  = false;
	patternResult.msg = null;

	let noSuchThing = false;
	let ambiguous = false;
	
	while (ppos < pattern.length && tpos < tokens.length && matching) {
	    let block = pattern[ppos];
	    let bcw = block.consumeWords(tokens, tpos, null, actor, pattern.preventNS);
	    
	    if (bcw.words == 0) {
		matching = false;
	    }
	    else {
		tpos = tpos + bcw.words;
		ppos = ppos + 1;

		if (bcw.hasObj) {
		    objs.push(bcw.objs);
		}
		if (bcw.noSuchThing) {
		    noSuchThing = true;
		}
	    }
	} // while (ppos ...)
	
	//console.log('ppos: ' + ppos);
	//console.log('tpos: ' + tpos);

	if (ppos == pattern.length && tpos == tokens.length) {

	    patternResult.matched = true;
	    
	    for (let i = 0; i < objs.length; i++) {
		let possible = objs[i];
		let resolved = this.resolveAmbiguities(pattern.verb, possible);
		objs[i] = resolved;

		if (objs[i].length != 1) {
		   
		    console.log('Ambiguous object with length: ' +
				objs[i].length);

		    ambiguous = true;

		    msg = "I can't tell whether you meant ";
		    for (let j = 0; j < objs[i].length; j++) {
			msg += objs[i][j].getName(game.lang.DEF);
			if (j < objs[i].length - 2) {
			    msg += ", ";
			}
			else if (j < objs[i].length - 1) {
			    msg += ' or ';
			}
			else {
			    msg += '.';
			}
		    }

		    patternResult.ambiguous = msg;
		}
	    }

	    if (noSuchThing) {
		patternResult.noSuchThing = true;
		patternResult.msg = "You can't see any such thing!";
	    }
	    else if (ambiguous) {
		patternResult.ambiguous = true;
		patternResult.msg = msg;
	    }
	    else {
		let objWrapper = {};

		objWrapper.getObject = function(i) {
		    var objArray = objs[i-1];
		    if (objArray && objArray.length == 1) {
			return objArray[0];
		    }
		    else {
			return null;
		    }
		};
		patternResult.clear = builder(objWrapper, game, actor);
	    }
	}


	//console.log('returning output with msg: ' + output.msg);
	//console.log('output result is: ' + output.result);
	return patternResult;
    };

    parser.createBlock = function(str, preventNS) {

	let block = {};
	block.str = str;
	
	block.consumeWords = function(tokens, start, next, actor, preventNS) {

	    if (this.str.substring(0, 1) == '<') {
		let bcw = parser.findObject(this.str, tokens, start,
					    next, actor, preventNS);
		return bcw;
	    }
	    else {
		let bcw = {};
		//console.log('matching word: ' + this.str);
		if (parser.matchSingleToken(this.str, tokens[start])) {
		    bcw.words = 1;
		    bcw.hasObj = false;
		}
		else {
		    bcw.words = 0;
		    bcw.hasObj = false;
		}
		return bcw;
	    }
	};
	return block;
    };

    parser.matchSingleToken = function(blockStr, token) {
	let alts = blockStr.split('|');
	for (let i = 0; i < alts.length; i++) {
	    if (token == alts[i]) {
		return true;
	    }
	}
	return false;
    };

    parser.findObject = function(str, tokens, start, next, actor, preventNS) {
	let scope = [];

	let needActorScope = true;
	
	if (str == '<dir>') {
	    scope = game.compass.getScope();
	    needActorScope = false;
	}
	else if (str.substring(1, 6) == 'scope') {
	    let rule = (str.substring(1, str.length - 1).split('='))[1];
	    this.scopeRules[rule](scope);
	    //console.log('scope now has length: ' + scope.length);
	    
	    needActorScope = false;
	}

	if (needActorScope) {
	    scope = actor.getLocation().getScope();
	}
	
	let matches = [];
	let max = 0;
	for (let i = 0; i < scope.length; i++) {
	    let objN = scope[i].consumeWords(tokens, start);
	    if (objN > 0) {
		matches.push(scope[i]);
		if (objN > max) {
		    max = objN;
		}
	    }
	}
	
	let bcw = {};
	bcw.words = 0;
	bcw.hasObj = false;
	bcw.noSuchThing = false;
	
	if (max > 0) {
	    bcw.words = max;
	    bcw.hasObj = true;
	    bcw.objs = matches;
	}
	else {
	    let countBadWords = 0;
	    let seekingNext = true;
	    if (preventNS) {
		seekingNext = false;
	    }
	    let foundNext = false;
	    while (seekingNext) {
		if (start + countBadWords >= tokens.length) {
		    if (next == null) {
			foundNext = true;
		    }
		    seekingNext = false;
		}
		else if (tokens[start + countBadWords] == next) {
		    foundNext = true;
		    seekingNext = false;
		}
		else {
		    countBadWords++;
		}
		
	    }
	    if (foundNext) {
		bcw.words = countBadWords;
		bcw.noSuchThing = true;
	    }
	    else {
		bcw.words = 0;
	    }
	}
	return bcw;
    };

    parser.scopeRules = {};

    parser.scopeRules.topics = function(scope) {
	console.log('checking scope');
	parser.game.topics.addToScope(scope, true, true);
    };

    parser.resolveAmbiguities = function(verb, objs) {
	var scores = [];
	var max = 0;
	//console.log('resolving ' + objs.length + ' objects');
	for (var i = 0; i < objs.length; i++) {
	    var score = objs[i].getScore(verb);
	    if (score > max) { max = score; }
	    scores.push(score);
	}
	var result = [];
	for (var i = 0; i < scores.length; i++) {
	    //console.log('checking score: ' + scores[i] + ' ?= ' + max);
	    if (scores[i] == max) {
		result.push(objs[i]);
	    }
	}
	return result;
    };

    
    return parser;
};
