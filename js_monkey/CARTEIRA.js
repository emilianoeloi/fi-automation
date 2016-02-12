// ==UserScript==
// @name         CARTEIRA
// @namespace    http://folhainvest.folha.uol.com.br
// @version      0.0.1
// @description  try to take over the world!
// @author       Emiliano S. Barbosa
// @grant        none
// @include      http://folhainvest.folha.uol.com.br/carteira
// @require      http://cdn.fxos.com.br/fi_automation/libs.js
// @connect      *
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_setClipboard
// @grant unsafeWindow
// @grant window.close
// @grant window.focus
// @run-at document-end
// ==/UserScript==
/* jshint -W097 */

var r = new HTTPRequest;
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

var saveSellStep = function(sellStep){
    url = [];
    url.push("http://emiliano.bocamuchas.org:5000/api/1.0/setting");
    url.push(sellStep.timeKey);
    url.push(sellStep.code);
    url.push("sellStep");
   r.post(url.join("/"), {"step":sellStep.step}, function(msg){
   });
}
var once = true;
var checkSellStep = function(sellStep, success, error){
    url = [];
    url.push("http://emiliano.bocamuchas.org:5000/api/1.0/setting");
    url.push(sellStep.timeKey);
    url.push(sellStep.code);
    url.push("sellStep");
    url.push(sellStep.step);
    r.get(url.join('/'), 
         {},
         function(r){
            if(once){
                once = false;
                if(r.responseText != "" && JSON.parse(r.responseText).step == sellStep.step){
                  success();
                }else{
                  error();
                }
            }
        
         });
}

var savePortfolio = function(portfolio){
    r.post("http://emiliano.bocamuchas.org:5000/api/1.0/portfolio", 
           {"currentTime": getTimeDescription(), "portfolio": JSON.stringify(portfolio)}, function(msg){
       console.log('savePortfolio',msg);
    });
}

var clickSellIndex = 0;
var clickSellInterval;
var clickSellStart = function(){
   clickSellInterval = setInterval(function(){
       clickSell();
   }, 5000);
}
var clickSell = function(){
   if(carteira[clickSellIndex] == undefined){
       return;
       clearInterval(clickSellInterval);
   }
    checkSellStep({"timeKey": getTimeDescription(),
                   "code": carteira[clickSellIndex].code,
                   "name": "SELL_STEP",
                   "step": "finish"}, function(){
       carteira[clickSellIndex].sellAction.click();
        clickSellIndex++;
    }, function(){
        console.info('Aguardando finalizacao da venda');
        once = true;
    });
}
var carteira = [];
var table = document.querySelector(".fiTable")
for (var i = 1, row; row = table.rows[i]; i++) {
    var papel = {};
    papel.code = row.cells[0].childNodes[0].innerHTML; 
    if(papel.code == "Total"){
        break;
    }
    papel.name = row.cells[1].innerHTML;
    papel.buyAction = row.cells[2].childNodes[0].childNodes[0];
    papel.sellAction = row.cells[3].childNodes[0].childNodes[0];
    papel.qtd = row.cells[4].innerHTML;
    papel.medium = row.cells[5].innerHTML;
    papel.current = row.cells[6].innerHTML;
    papel.total = row.cells[7].innerHTML;
    papel.variation = row.cells[8].innerHTML;
    papel.rate = row.cells[9].innerHTML;
    
    papel.buyAction.setAttribute('target','_blank');
    papel.sellAction.setAttribute('target','_blank');
    
    carteira.push(papel);
    
}
savePortfolio(carteira);
clickSellStart();
console.log(carteira);