var modules = require('./modules');
var app = modules.app;
var rootRote = "/api/1.0";

/* BUSINESS */
var getTimeDescription = function(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    } 

    if(mm<10) {
        mm='0'+mm
    } 

    return mm+'/'+dd+'/'+yyyy;
} 
var saveSetting = function(portfolioCurrentTime){
	var locaPortfolioCurrentTime = getTimeDescription();
	modules.collection.setting.insert({
		"server": locaPortfolioCurrentTime,
		"request": portfolioCurrentTime,
		"name": "PORTFOLIO"
	}, function(err, doc){

	});
}

var checkSetting = function(portfolioCurrentTime, exists, nonExists){
	modules.collection.setting.find({
		"request":portfolioCurrentTime,
		"name": "PORTFOLIO"
	}, function(err, doc){
		if(err){
			nonExists();
		}else{
			console.log('checkSetting doc', doc);
			if(doc.length > 0){
				exists();
			}else{
				nonExists();
				saveSetting(portfolioCurrentTime);
			}
		}
	});
}
	
/* PORTFOLIO */
var portfolioRoute = "/portfolio";
modules.app.post(rootRote+portfolioRoute, function(req, res) { 
	console.log(req.body.currentTime);
	var portfolio = JSON.parse(req.body.portfolio);
	var pToSave = {"portfolio":portfolio};
	checkSetting(req.body.currentTime, function(){
		res.json(302);
	}, function(){
		modules.collection.portfolio.insert(pToSave, function(err, doc){
		if(err){
			res.json(500, err);
		}else{
			res.json(201, doc);
		}
	}); 
	});
});
modules.app.get(rootRote+portfolioRoute, function(req, res) { 
	modules.collection.portfolio.find({}, function(err, doc){
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