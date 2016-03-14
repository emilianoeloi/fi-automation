// ==UserScript==
// @name         COMPRAR
// @namespace    http://folhainvest.folha.uol.com.br
// @version      0.1.0
// @description  try to take over the world!
// @author       Emiliano S. Barbosa
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        unsafeWindow
// @grant        window.close
// @grant        window.focus
// @require      http://cdn.fxos.com.br/fi_automation/jquery.js
// @require      http://cdn.fxos.com.br/fi_automation/libs.js
// @include      http://folhainvest.folha.uol.com.br/compr*
// @connect      *
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
    // console.info('checkAPI', this.step);

    urlss = [];
    urlss.push(urlAPI);
   urlss.push("setting");
   urlss.push(this.step.timeKey);
   urlss.push(this.step.code);
   urlss.push("buyStep");
   urlss.push(this.step.step);

    $.ajax({
      method: "GET",
      url: urlss.join('/'),
      data: {}
   }).done(function(r){
        // console.info(r);
      if(r.step == that.step.step){
        that.continue()
      }else{
        that.wait();
      }
    }).fail(function(jqXHR, textStatus, errorThrown){
       // console.info('fail',jqXHR, textStatus, errorThrown);
        that.wait();
    });
}
StepWaiting.prototype.wait = function(){
   // console.info('Step Waiting wait');
}
StepWaiting.prototype.continue = function(){
    var that = this;
   // console.info('Step Waiting continue');
   clearInterval(that.interval);
   that.afterAction();
}
var saveStep = function(stepToSave, success){
  // console.info('saveStep - stepToSave', stepToSave);
    urlss = [];
    urlss.push(urlAPI);
    urlss.push("setting");
    urlss.push(stepToSave.timeKey);
    urlss.push(stepToSave.code);
    urlss.push("buyStep");
    $.ajax({
      method: "POSt",
      url: urlss.join('/'),
      data: {"step":stepToSave.step}
    }).always(function(){
        if(typeof success == 'function'){
           success();
        }
    });
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
        }, 2000);
    }else{
        // console.log('start shell');
        loadStock(f.company.value);
    }
}
var loadStock = function(stockCode){
    var urlss = [];
    urlss.push(urlAPI);
    urlss.push('stock');
    urlss.push(getTimeDescription());
    urlss.push(stockCode);
    $.ajax({
      method: "GET",
      url: urlss.join('/'),
      data: {}
    }).done(function(r){
// console.log(r)
      readyToBuy = {};
      readyToBuy.timeKey = r.timeKey;
      readyToBuy.code = r.code;
      readyToBuy.name = globalStepName;
      readyToBuy.step = "readyToBuy";

      buyList = r.buyList;

        startListeners(readyToBuy);

      saveStep(readyToBuy);
    });
}
var globalStepName = "buyStep";
var readyToBuy;
var b02;
var b04;
var b06;
var buyList;
var sendBuy = function(buy){
     setTimeout(function(){
         f.value.value = buy.buyPrice;
         f.quantity.value = buy.qtdBuy;
         f.pricing.checked = true;
         f.expiration_date.value = buy.expireDate;
         // console.info('sendBuy', f);
         setTimeout(function(){
              // console.info('sendBuy', 'execute', f.execute);
              f.execute.click();
         }, 2000);
     },2000);
 }

  var prepareAction = function(step){
    cookieMng.set("timeKey", step.timeKey);
    cookieMng.set("code", step.code);
    cookieMng.set("name", step.name);
    cookieMng.set("step", step.step);
  }

 var startListeners = function(stock){
  b02 = {};
  b02.timeKey = stock.timeKey;
  b02.code = stock.code;
  b02.name = globalStepName;
  b02.step = "buy02";

  b04 = {};
  b04.timeKey = stock.timeKey;
  b04.code = stock.code;
  b04.name = globalStepName;
  b04.step = "buy04";

  b06 = {};
  b06.timeKey = stock.timeKey;
  b06.code = stock.code;
  b06.name = globalStepName;
  b06.step = "sell06";

     sF = {};
  sF.timeKey = stock.timeKey;
  sF.code = stock.code;
  sF.name = globalStepName;
  sF.step = "finish";

  /// Waiting ultil to ready to sell
  new StepWaiting(readyToBuy, function(){
    prepareAction(b02);
    // console.info('StepWaiting', buyList);
    sendBuy(buyList[0]);
  });
  new StepWaiting(b02, function(){
    prepareAction(b04);
    sendBuy(buyList[1]);
  });
  new StepWaiting(b04, function(){
    prepareAction(b06);
    sendBuy(buyList[2]);
  });
  new StepWaiting(b06, function(){
      saveStep(sF, function(){
         window.close();
      });
  });
 }
loadFields();
checkSelectedCompany();
