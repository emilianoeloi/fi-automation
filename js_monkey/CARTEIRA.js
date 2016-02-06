// ==UserScript==
// @name         CARTEIRA
// @namespace    http://folhainvest.folha.uol.com.br
// @version      0.0.1
// @description  try to take over the world!
// @author       Emiliano S. Barbosa
// @grant        none
// @include      http://folhainvest.folha.uol.com.br/carteira
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

    return mm+'/'+dd+'/'+yyyy;
}    

var savePortfolio = function(portfolio){
    r.post("http://emiliano.bocamuchas.org:5000/api/1.0/portfolio", 
           {"currentTime": getTimeDescription(), "portfolio": JSON.stringify(portfolio)}, function(msg){
       console.log('savePortfolio',msg);
    });
}

var clickShell = function(index){
   if(carteira[index] == undefined){
       return;
   }
   carteira[index].shellAction.click();
    index++;
   setTimeout(function(){
       clickShell(index);
   },1000);
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
    papel.shellAction = row.cells[3].childNodes[0].childNodes[0];
    papel.qtd = row.cells[4].innerHTML;
    papel.medium = row.cells[5].innerHTML;
    papel.current = row.cells[6].innerHTML;
    papel.total = row.cells[7].innerHTML;
    papel.variation = row.cells[8].innerHTML;
    papel.rate = row.cells[9].innerHTML;
    
    papel.buyAction.setAttribute('target','_blank');
    papel.shellAction.setAttribute('target','_blank');
    
    carteira.push(papel);
    
}
savePortfolio(carteira);
// clickShell(0);
// console.log(carteira);