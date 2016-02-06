// ==UserScript==
// @name         VENDER
// @namespace    http://folhainvest.folha.uol.com.br
// @version      0.0.1
// @description  try to take over the world!
// @author       Emiliano S. Barbosa
// @grant        none
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

HTTPRequest = function(){};
with({$: HTTPRequest.prototype}){
    $.isSupported = function(){
        return !!this.getConnection();
    };
    $.events = ["start", "open", "send", "load", "end"];
    $.filter = encodeURIComponent;
    $.getConnection = function(){
        var i, o = [function(){return new ActiveXObject("Msxml2.XMLHTTP");},
        function(){return new ActiveXObject("Microsoft.XMLHTTP");},
        function(){return new XMLHttpRequest;}];
        for(i = o.length; i--;) try{return o[i]();} catch(e){}
        return null;
    };
    $.formatParams = function(params){
        var i, r = [];
        for(i in params) r[r.length] = i + "=" + (this.filter ? this.filter(params[i]) : params[i]);
        return r.join("&");
    };
    $.get = function(url, params, handler, waitResponse){
        return this.request("GET", url + (url.indexOf("?") + 1 ? "&" : "?") + this.formatParams(params), null, handler, null, waitResponse);
    };
    $.post = function(url, params, handler, waitResponse){
        return this.request("POST", url, params = this.formatParams(params), handler, {
            "Connection": "close",
            "Content-Length": params.length,
            "Method": "POST " + url + " HTTP/1.1",
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        }, waitResponse);
    };
    $.request = function(method, url, params, handler, headers, waitResponse){
        var i, self = this, o = self.getConnection(), f = handler instanceof Function;
        try{
            o.open(method, url, !waitResponse);
            waitResponse || (o.onreadystatechange = function(){
                var s = $.events[o.readyState];
                handler && (f ? handler(o) : s in handler && handler[s].call(self, o));
            });
            if(headers){
                for(i in {USER_AGENT: 0, XUSER_AGENT: 0})
                    i in headers || (headers[i] = "XMLHttpRequest");
                for(i in headers)
                    o.setRequestHeader(i, headers[i]);
            }
            o.send(params);
            waitResponse && handler && (f ? handler(o) : handler["end"] && handler["end"].call(self, o));
            return true;
        }
        catch(e){
            return false;
        }
    };
}

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
   r.get('http://emiliano.bocamuchas.org:5000/api/1.0/stock/'+getTimeDescription()+'/'+stockCode, 
         {},
         function(a, b, c){
            if(!received){
              console.log('Stock', JSON.parse(a.responseText));
                sendSell(JSON.parse(a.responseText).sellList, 0);
              received = true;  
            }    
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