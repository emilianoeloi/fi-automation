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
   }, 5000);
};
StepWaiting.prototype.checkAPI = function(){
    var that = this;
    console.info('checkAPI');
   
    urlss = [];
   urlss.push("http://emiliano.bocamuchas.org:5000/api/1.0/setting");
   urlss.push(this.step.timeKey);
   urlss.push(this.step.code);
   urlss.push("sellStep");
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
   console.info('Step Waiting wait');
}
StepWaiting.prototype.continue = function(){
    var that = this;
   console.info('Step Waiting continue');
   clearInterval(that.interval);
   that.afterAction(); 
}
var saveStep = function(stepToSave){
  console.info('saveStep - stepToSave', stepToSave);
    urlss = [];
    urlss.push("http://emiliano.bocamuchas.org:5000/api/1.0/setting");
    urlss.push(stepToSave.timeKey);
    urlss.push(stepToSave.code);
    urlss.push("sellStep");
    $.ajax({
      method: "POSt",
      url: urlss.join('/'),
      data: {"step":stepToSave.step}
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
        }, 5000);
    }else{
        console.log('start shell');
        loadStock(f.company.value);    
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
console.log(r)
      readyToSell = {};
      readyToSell.timeKey = r.timeKey;
      readyToSell.code = r.code;
      readyToSell.name = "SELL_STEP";
      readyToSell.step = "readyToSell";

      sellList = r.sellList;
        
        startListeners(readyToSell);

      saveStep(readyToSell);
    });
}
var readyToSell;
var s05;
var s15;
var sellList;
var sendSell = function(sell, success){
     setTimeout(function(){
         f.value.value = sell.sellPrice;
         f.quantity.value = sell.qtdValue;
         f.pricing.checked = true;
         f.expiration_date.value = sell.expireDate;
         setTimeout(function(){
             f.execute.click();
             success();   
         }, 2000);
     },2000);
 }
 var startListeners = function(stock){
  s05 = {};
  s05.timeKey = stock.timeKey;
  s05.code = stock.code;
  s05.name = "SELL_STEP";
  s05.step = "sell05"; 

  s15 = {};
  s15.timeKey = stock.timeKey;
  s15.code = stock.code;
  s15.name = "SELL_STEP";
  s15.step = "sell15"; 

  /// Waiting ultil to ready to sell
  new StepWaiting(readyToSell, function(){
    sendSell(sellList[0], function(){
      saveStep(s05);
    });
  });
  new StepWaiting(s05, function(){
    sendSell(sellList[1], function(){
      saveStep(s15);
    });
  });
  new StepWaiting(s15, function(){
    sendSell(sellList[2], function(){
      console.info('end');
    });
  });
 }
loadFields();
checkSelectedCompany();
