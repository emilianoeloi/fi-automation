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
      sendSell(r.sellList, 0);
    });
}
var sendSell = function(sellList, index){
    next = index +1;
    var sell = sellList[index];
    if (sell == undefined){
        return;
    }
    console.info(index, next, sell);

    setTimeout(function(){
        f.value.value = sell.sellPrice;
        f.quantity.value = sell.qtdValue;
        f.pricing.checked = true;
        f.expiration_date.value = sell.expireDate;
        setTimeout(function(){
            f.execute.click();
            sendSell(sellList, next);   
        }, 2000);
    },2000);
}
loadFields();
checkSelectedCompany();