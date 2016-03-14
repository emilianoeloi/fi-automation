// ==UserScript==
// @name         CARTEIRA
// @namespace    http://folhainvest.folha.uol.com.br
// @version      0.1.0
// @description  try to take over the world!
// @author       Emiliano S. Barbosa
// @grant        none
// @include      http://folhainvest.folha.uol.com.br/carteira
// @require      http://cdn.fxos.com.br/fi_automation/jquery.js
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

var ENV = "DEV";

var ENV_LIST = {};
ENV_LIST["PROD"] = {
  "urlAPI":"http://emiliano.bocamuchas.org:5000/api/1.0"
};
ENV_LIST["DEV"] = {
  "urlAPI":"http://localhost:5000/api/1.0"
};

var urlAPI = ENV_LIST[ENV].urlAPI;

var cookieMng = {
"set": function(a,b){
document.cookie=a+"="+b;
},"get": function(cname){
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}};

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

/// Step Waiting
var StepWaiting = function(step, afterAction){
    var that = this;
   this.step = step;
   this.afterAction = afterAction;
   this.interval = setInterval(function(){
       that.checkAPI();
   }, 2000);
};
StepWaiting.prototype.checkAPI = function(){
    var that = this;

  urlss = [];
  urlss.push(urlAPI);
  urlss.push("setting");
  urlss.push(this.step.timeKey);
  urlss.push(this.step.code);
  urlss.push(this.step.name);
  urlss.push(this.step.step);

  $.ajax({
      method: "GET",
      url: urlss.join('/'),
      data: {}
   }).done(function(r){
        console.info(r);
      if(r.step == that.step.step){
        that.continue()
      }else{
        that.wait();
      }
    }).fail(function(jqXHR, textStatus, errorThrown){
       console.info('fail',jqXHR, textStatus, errorThrown);
        that.wait();
    });
}
StepWaiting.prototype.wait = function(){
   console.info('Step Waiting [wait]');
}
StepWaiting.prototype.continue = function(){
    var that = this;
   console.info('Step Waiting [continue]');
   clearInterval(that.interval);
   that.afterAction();
}
var saveStep = function(stepToSave){
  console.info('saveStep - stepToSave', stepToSave);
    urlss = [];
    urlss.push(urlAPI);
    urlss.push("setting");
    urlss.push(stepToSave.timeKey);
    urlss.push(stepToSave.code);
    urlss.push(stepToSave.name);
    $.ajax({
      method: "POSt",
      url: urlss.join('/'),
      data: {"step":stepToSave.step}
    });
}

var savePortfolio = function(portfolio){
  $.ajax({
      method: "POST",
      url: urlAPI+"/portfolio",
      data: {"currentTime": getTimeDescription(), "portfolio": JSON.stringify(portfolio)}
    }).done(function(msg){
      console.info('savePortfolio',msg);
    });
}
var clickSellIndex = 0;
var sFinish = {};
var startSell = function(){

  if(carteira[clickSellIndex] == undefined){
    return;
  }
  stock = carteira[clickSellIndex];

  sFinish.timeKey = getTimeDescription();
  sFinish.code = stock.code;
  sFinish.name = "sellStep";
  sFinish.step = "finish";

  /// Waiting ultil to ready to sell
  new StepWaiting(sFinish, function(){
    clickSellIndex++;
    startSell();
  });

  stock.sellAction.click();

}

var clickBuyIndex = 0;
var bFinish = {};
var startBuy = function(){

  if(carteira[clickBuyIndex] == undefined){
    return;
  }
  stock = carteira[clickBuyIndex];

  bFinish.timeKey = getTimeDescription();
  bFinish.code = stock.code;
  bFinish.name = "buyStep";
  bFinish.step = "finish";

  /// Waiting ultil to ready to sell
  new StepWaiting(bFinish, function(){
    clickBuyIndex++;
    startBuy();
  });

  stock.buyAction.click();

}

var carteira = [];

var amountTable = document.getElementsByClassName("fiTable")[1];
var cap = amountTable.rows[1].cells[0].innerHTML;
carteira.capital = cap.replace('.','').replace(',','.');

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

    console.log(carteira.capital, table.rows.length);
    papel.capitalToBuy = carteira.capital / (table.rows.length - 2);

    papel.buyAction.setAttribute('target','_blank');
    papel.sellAction.setAttribute('target','_blank');

    carteira.push(papel);

}
savePortfolio(carteira);

/// startSell();
startBuy();

window.onbeforeunload = function() {
    console.log("FI Automation in action!");
  return false;
}
