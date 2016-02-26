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
    return "26/02/2016";
}
function tomorrow(){
	return '26/02/2016';
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
	prepareStockBuyValues(stock);

	return stock;
}
var createSell = function(key, stock, gainPercent,  qtdPercent){
	var sell = {key:key};
	sell.qtdPercent = (qtdPercent * 100) + '%';

	sell.gainPercent = (gainPercent * 100).toFixed(2) + '%';
	sell.qtdValue = parseInt(stock.qtd * qtdPercent);

	sell.gainValue = stock.medium * gainPercent;
	sell.sellPrice = stock.medium + sell.gainValue;

	sell.gainValue = sell.gainValue.toFixed(2);
	sell.sellPrice = sell.sellPrice.toFixed(2);

	sell.expireDate = nextFriday();
	return sell;
}
/*
 amount     | qtdPercent |   qtdValue | lostPercent | buyValue  |   qtdBuy | 
 ===========|============|============|=============|============|==========|
 R$3.109,00 |        25% | R$  777,25 |          2% |   R$ 18.17 |      42  |
 R$3.109,00 |        25% | R$  777,25 |          4% |   R$ 17,80 |      43  |
 R$3.109,00 |        50% | R$1.554,50 |          6% |   R$ 17,43 |      89  |
 ===========|============|============|=============|============|==========|
            |       100% | R$3.109,00 |              
*/
var createBuy = function(key, stock, lostPercent,  qtdPercent){
	var buy = {key:key};

	buy.qtdValue = stock.capitalToBuy * qtdPercent;
	buy.lostValue = stock.medium * lostPercent;
	buy.buyPrice = (stock.medium - buy.lostValue).toFixed(2);
	buy.qtdBuy = (buy.qtdValue / buy.buyPrice).toFixed(0);
	

	buy.qtdPercent = (qtdPercent * 100) + '%';
	buy.lostPercent = (lostPercent * 100) + '%';

	buy.expireDate = tomorrow();

	console.info('createBuy', buy);

	return buy;
}
var prepareStockSellValues = function(stock){
	stock.sellList =[];
	stock.sellList.push(createSell(0, stock, 0.10, 0.25));
	stock.sellList.push(createSell(1, stock, 0.20, 0.25));
	stock.sellList.push(createSell(2, stock, 0.30, 0.5));
}
var prepareStockBuyValues = function(stock){
	stock.buyList = [];
	stock.buyList.push(createBuy(0, stock, 0.02, 0.25));
	stock.buyList.push(createBuy(1, stock, 0.04, 0.25));
	stock.buyList.push(createBuy(2, stock, 0.06, 0.50));
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

var savePortfolio = function(portfolio){
	modules.collection.portfolio.update(
		{"timeKey":portfolio.timeKey},
		portfolio,
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
modules.app.get(rootRote+portfolioRoute+"/:timeKey", function(req, res) { 
	var timeKey = req.params.timeKey;
	modules.collection.portfolio.find({"timeKey":timeKey}, function(err, doc){
		if(err){
			res.status(500).send(err);
		}else{
			res.status(200).send(doc);
		}
	}); 
});
modules.app.put(rootRote+portfolioRoute+"/:timeKey", function(req, res) { 
	var timeKey = req.params.timeKey;
	var status = req.body.status;
	modules.collection.portfolio.find({"timeKey":timeKey}, function(err, doc){
		if(err){
			res.status(500).send(err);
		}else{
			if (doc.length == 0){
				res.status(404).send("Tente novamente mais tarde ;)");
			}
			var portfolio = doc[0];
			portfolio.status = status;
			savePortfolio(portfolio);
			res.status(200).send();
		}
	})
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

	modules.collection.stock.find({
		"timeKey": timeKey,
		"code": code
	}, function(err, doc){
		if(err){
			res.status(500).send(err);
		}else{
			res.status(200).send(doc[0]);
		}
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
modules.app.post(rootRote+settingRoute+"/:timeKey/:code/:stepName", function(req, res) { 
	var timeKey = req.params.timeKey;
	var code = req.params.code;
	var stepName = req.params.stepName;
	var step = req.body.step;
	
	checkSetting({
		"timeKey": timeKey,
		"code": code,
		"name": stepName,
		"step": step
	}, function(){
		res.json(302);
	}, function(){
		res.json(201); 
	});
});
modules.app.get(rootRote+settingRoute+"/:timeKey/:code/:stepName/:step", function(req, res) { 
	var timeKey = req.params.timeKey;
	var code = req.params.code;
	var step = req.params.step;
	var stepName = req.params.stepName;

	modules.collection.setting.find({
		"timeKey": timeKey,
		"code": code,
		"name": stepName,
		"step": step
	}, function(err, doc){
		if(err || doc.length == 0){
			res.status(404).send("Tente donovo mais tarde ;)");
		}else{
			res.status(200).send(doc[0]);
		}
	});
});