// ==UserScript==
// @name         CONFIRMAR
// @namespace    http://folhainvest.folha.uol.com.br
// @version      0.0.4
// @description  try to take over the world!
// @author       Emiliano S. Barbosa
// @grant        none
// @require      http://cdn.fxos.com.br/fi_automation/jquery.js
// @require      http://cdn.fxos.com.br/fi_automation/libs.js
// @include      http://folhainvest.folha.uol.com.br/confirmar
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

var saveStep = function(stepToSave, success){
  console.info('saveStep - stepToSave', stepToSave);
    urlss = [];
    urlss.push("http://emiliano.bocamuchas.org:5000/api/1.0/setting");
    urlss.push(stepToSave.timeKey);
    urlss.push(stepToSave.code);
    urlss.push("sellStep");
    $.ajax({
      method: "POST",
      url: urlss.join('/'),
      data: {"step":stepToSave.step}
    }).done(function(){
    	success();
    }).fail(function(){
    	success();
    });
}

var fns = ['confirm'];
var received = false;
var f = {};
var loadFields = function(){
	for(var index in fns){
		var fn = fns[index];
		f[fn] = document.getElementsByName(fn)[0];
	}
	var step = {
		"timeKey": cookieMng.get("timeKey"),
		"code": cookieMng.get("code"),
		"name": cookieMng.get("name"),
		"step": cookieMng.get("step")
	}
    
    saveStep(step, function(){
        f.confirm.click();
    });
}
loadFields();