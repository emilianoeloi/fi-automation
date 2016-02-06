var modules = require('./modules');
var app = modules.app;
var rootRote = "/api/1.0";

/* PORTFOLIO */
var portfolioRoute = "/portfolio";
modules.app.post(rootRote+portfolioRoute, function(req, res) { 
	console.log(req.body.portfolio);
	var portfolio = JSON.parse(req.body.portfolio);
	var pToSave = {"portfolio":portfolio};
	modules.portfolioCollection.insert(pToSave, function(err, doc){
		if(err){
			res.json(500, err);
		}else{
			res.json(201, doc);
		}
	}); 
});
modules.app.get(rootRote+portfolioRoute, function(req, res) { 
	modules.portfolioCollection.find({}, function(err, doc){
		if(err){
			res.json(500, err);
		}else{
			res.json(doc);
		}
	}); 
});
modules.app.get(rootRote+portfolioRoute+"/:", function(req, res) { 
	res.json(); 
});
modules.app.put(rootRote+portfolioRoute, function(req, res) { 
	res.json(); 
});

/* STOCK */
var stockRoute = "/stock";