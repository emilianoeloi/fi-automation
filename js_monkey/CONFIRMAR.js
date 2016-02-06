// ==UserScript==
// @name         CONFIRMAR
// @namespace    http://folhainvest.folha.uol.com.br
// @version      0.0.1
// @description  try to take over the world!
// @author       Emiliano S. Barbosa
// @grant        none
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

var fns = ['confirm'];
var received = false;
var f = {};
var loadFields = function(){
	for(var index in fns){
		var fn = fns[index];
		f[fn] = document.getElementsByName(fn)[0];
	}
    setTimeout(function(){
        f.confirm.click();
        window.close();
    }, 2000);
}
loadFields();