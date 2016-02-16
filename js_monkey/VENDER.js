// ==UserScript==
// @name         VENDER
// @namespace    http://folhainvest.folha.uol.com.br
// @version      0.0.2
// @description  try to take over the world!
// @author       Emiliano S. Barbosa
// @grant        none
// @require      http://cdn.fxos.com.br/fi_automation/jquery.js
// @require      http://cdn.fxos.com.br/fi_automation/libs.js
// @include      http://folhainvest.folha.uol.com.br/vender*
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

/// Check sell is started
var sellStartInterval;
var sellStartAfterSuccess = function(){};
var sellStartSuccess = function(data){
  clearInterval(sellStartInterval);
  sellStartAfterSuccess();
}
var sellStartWait = function(){
  console.log('Sell Start Wait');
}
var sellStartStart = function(stockCode){
   sellStartInterval = setInterval(function(){
       checkSellStep({
        "timeKey": getTimeDescription(),
        "code": stockCode,
        "name": "SELL_STEP",
        "step": "start"
       }, sellStartSuccess, sellStartWait);
   }, 5000);
}

var fns = ['start_stop',
'sell',
'orderBalance',
'user_balance',
'transactions_total:',
'company',
'pricing',
'value',
'quantity',
'expiration_date',
'execute.x',
'execute.y',
'execute'];
var received = false;
var f = {};
var loadFields = function(){
    for(var index in fns){
        var fn = fns[index];
        f[fn] = document.getElementsByName(fn)[0];
    }
    f.frm = document.getElementById("transaction");
    f.frm.setAttribute('target', '_blank');

};
var checkSelectedCompany = function(){
    if(f.company.value == ""){
        setTimeout(function(){
            checkSelectedCompany();
        }, 5000);
    }else{
        console.log('start shell');
        sellStartAfterSuccess = function(){
            loadStock(f.company.value);    
        }
        sellStartStart(f.company.value);
    }
}
var loadStock = function(stockCode){
    var urlss = [];
    urlss.push('http://emiliano.bocamuchas.org:5000/api/1.0/stock');
    urlss.push(getTimeDescription());
    urlss.push(stockCode);
    $.ajax({
      method: "GET",
      url: urlss.join('/'),
      data: {}
    }).done(function(r){
        sendSellList = r.sellList;
    });
}
var sendSellList = [];
var sendSellIndex = 0;
var sendSellInterval;
var sendSellStart = function(){
   sendSellInterval = setInterval(function(){
       sendSell();
   }, 5000);
}
var sendSell = function(){
    var sell = sendSellList[sendSellIndex];
    if (sell == undefined){
        return;
    }
    console.info(sendSellIndex, next, sell);

    setTimeout(function(){
        f.value.value = sell.sellPrice;
        f.quantity.value = sell.qtdValue;
        f.pricing.checked = true;
        f.expiration_date.value = sell.expireDate;
        setTimeout(function(){
            f.execute.click();   
        }, 2000);
    },2000);
}
loadFields();
checkSelectedCompany();