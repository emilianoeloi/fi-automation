// ==UserScript==
// @name         VENDER
// @namespace    http://folhainvest.folha.uol.com.br
// @version      0.0.5
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
// @include      http://folhainvest.folha.uol.com.br/vender*
// @connect      *
// @run-at document-end
// ==/UserScript==
/* jshint -W097 */

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
var saveStep = function(stepToSave, success){
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
var s30;
var sellList;
var sendSell = function(sell){
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

  var prepareAction = function(step){
    cookieMng.set("timeKey", step.timeKey);
    cookieMng.set("code", step.code);
    cookieMng.set("name", step.name);
    cookieMng.set("step", step.step);
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

  s30 = {};
  s30.timeKey = stock.timeKey;
  s30.code = stock.code;
  s30.name = "SELL_STEP";
  s30.step = "sell30";
     
     sF = {};
  sF.timeKey = stock.timeKey;
  sF.code = stock.code;
  sF.name = "SELL_STEP";
  sF.step = "finish";

  /// Waiting ultil to ready to sell
  new StepWaiting(readyToSell, function(){
    prepareAction(s05);
    sendSell(sellList[0]);
  });
  new StepWaiting(s05, function(){
    prepareAction(s15);
    sendSell(sellList[1]);
  });
  new StepWaiting(s15, function(){
    prepareAction(s30);
    sendSell(sellList[2]);
  });
  new StepWaiting(s30, function(){
      saveStep(sF, function(){
         window.close();
      });
  });
 }
loadFields();
checkSelectedCompany();
