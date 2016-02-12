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

    return mm+'_'+dd+'_'+yyyy;
} 
function nextFriday() {
    return "19/02/2016";
}
var saveSetting = function(query, settingName){
	query.server = getTimeDescription();
	modules.collection.setting.insert(query, function(err, doc){

	});
}

var checkSetting = function(query,  exists, nonExists){
	modules.collection.setting.find(query, function(err, doc){
		if(err){
			nonExists();
		}else{
			console.log('checkSetting doc', doc);
			if(doc.length > 0){
				exists();
			}else{
				nonExists();
				saveSetting(query);
			}
		}
	});
}

var prepareStockToSave = function(stock){
	console.log('prepareStockToSave',stock);
	delete stock['buyAction'];
	delete stock['sellAction'];
	stock.qtd = Number(stock.qtd.replace('.',''));
	stock.medium = Number(stock.medium.replace(',','.'));
	stock.current = Number(stock.current.replace(',','.'));
	stock.total = Number(stock.total.replace('.','').replace(',','.'));
	stock.variation = Number(stock.variation.replace('.','').replace(',','.'));
	stock.rate = Number(stock.rate.replace(',','.'));
	prepareStockSellValues(stock);
	return stock;
}
var createSell = function(stock, gainPercent,  qtdPercent){
	var sell = {}
	sell.qtdPercent = (qtdPercent * 100) + '%';
	sell.gainPercent = (gainPercent * 100) + '%';
	sell.qtdValue = parseInt(stock.qtd * qtdPercent);
	sell.gainValue = stock.medium * gainPercent;
	sell.sellPrice = Number((stock.medium + sell.gainValue).toFixed(2));
	sell.expireDate = nextFriday();
	return sell;
}
var prepareStockSellValues = function(stock){
	stock.sellList =[];
	stock.sellList.push(createSell(stock, 0.05,0.25));
	stock.sellList.push(createSell(stock, 0.15,0.25));
	stock.sellList.push(createSell(stock, 0.30,0.5));
}
var preparePortfolioToSave = function(portfolio){
	for(var index in portfolio.stocks){
		prepareStockToSave(portfolio.stocks[index]);
		portfolio.stocks[index].timeKey = portfolio.timeKey;
		saveStock(portfolio.stocks[index]);
	}
}

var saveStock = function(stock){
	modules.collection.stock.update(
			{"code": stock.code},
			stock,
			{upsert:true}
		);
}
	
/* PORTFOLIO */
var portfolioRoute = "/portfolio";
modules.app.post(rootRote+portfolioRoute, function(req, res) { 
	var portfolio = JSON.parse(req.body.portfolio);
	var pToSave = {
		"timeKey": req.body.currentTime,
		"stocks":portfolio
	};
	checkSetting({
		"timeKey":req.body.currentTime,
		"name": "PORTFOLIO"
	}, function(){
		res.json(302);
	}, function(){
		preparePortfolioToSave(pToSave);
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
modules.app.get(rootRote+stockRoute, function(req, res) { 
	modules.collection.stock.find({}, function(err, doc){
		if(err){
			res.json(500, err);
		}else{
			res.json(doc);
		}
	}); 
});
modules.app.get(rootRote+stockRoute+'/:timeKey/:code', function(req, res) {
	var timeKey = req.params.timeKey;
	var code = req.params.code;

	checkSetting({
		"timeKey": timeKey,
		"code": code,
		"name": "STOCK"
	}, function(){
		res.json(404);
	}, function(){
		modules.collection.stock.find({
			"timeKey": timeKey,
			"code": code
		}, function(err, doc){
			if(err){
				res.json(500, err);
			}else{
				res.json(doc[0]);
			}
		}); 
	});

	
});

/* SETTING */
var settingRoute = "/setting";
modules.app.get(rootRote+settingRoute, function(req, res) { 
	modules.collection.setting.find({}, function(err, doc){
		if(err){
			res.json(500, err);
		}else{
			res.json(doc);
		}
	}); 
});
var sellStepRoute = "/sellStep";
modules.app.post(rootRote+settingRoute+"/:timeKey/:code"+sellStepRoute, function(req, res) { 
	var timeKey = req.params.timeKey;
	var code = req.params.code;
	var step = req.body.step;
	
	checkSetting({
		"timeKey": timeKey,
		"code": code,
		"name": "SELL_STEP",
		"step": step
	}, function(){
		res.json(302);
	}, function(){
		res.json(201); 
	});
});
modules.app.get(rootRote+settingRoute+"/:timeKey/:code"+sellStepRoute+"/:step", function(req, res) { 
	var timeKey = req.params.timeKey;
	var code = req.params.code;
	var step = req.params.step;

	modules.collection.setting.find({
		"timeKey": timeKey,
		"code": code,
		"name": "SELL_STEP",
		"step": step
	}, function(err, doc){
		if(err){
			res.json(404);
		}else{
			res.json(200, doc[0]);
		}
	});
});