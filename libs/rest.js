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

var prepareStockToSave = function(stock){
	console.log('prepareStockToSave',stock);
	delete stock['buyAction'];
	delete stock['shellAction'];
	stock.qtd = Number(stock.qtd.replace('.',''));
	stock.medium = Number(stock.medium.replace(',','.'));
	stock.current = Number(stock.current.replace(',','.'));
	stock.total = Number(stock.total.replace('.','').replace(',','.'));
	stock.variation = Number(stock.variation.replace('.','').replace(',','.'));
	stock.rate = Number(stock.rate.replace(',','.'));
	prepareStockShellValues(stock);
	return stock;
}
var createShell = function(mediumPrice, gainPercent){
	var shell = {}
	shell.percent = gainPercent;
	shell.gainValue = mediumPrice * gainPercent;
	shell.shellPrice = mediumPrice + shell.gainValue;
	return shell;
}
var prepareStockShellValues = function(stock){
	stock.shellList =[];
	stock.shellList.push(createShell(stock.medium, 0.05));
	stock.shellList.push(createShell(stock.medium, 0.15));
	stock.shellList.push(createShell(stock.medium, 0.30));
}
var preparePortfolioToSave = function(portfolio){
	for(var index in portfolio){
		prepareStockToSave(portfolio[index]);
	}
	console.log(portfolio);
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
		preparePortfolioToSave(portfolio);
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