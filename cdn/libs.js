
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

var saveSellStep = function(sellStep){
    urlss = [];
    urlss.push("http://emiliano.bocamuchas.org:5000/api/1.0/setting");
    urlss.push(sellStep.timeKey);
    urlss.push(sellStep.code);
    urlss.push("sellStep");
    $.ajax({
      method: "POSt",
      url: urlss.join('/'),
      data: {"step":sellStep.step}
    });
}
var checkSellStep = function(sellStep, success, error){
    urlss = [];
    urlss.push("http://emiliano.bocamuchas.org:5000/api/1.0/setting");
    urlss.push(sellStep.timeKey);
    urlss.push(sellStep.code);
    urlss.push("sellStep");
    urlss.push(sellStep.step);
    $.ajax({
      method: "GET",
      url: urlss.join('/'),
      data: {}
    }).done(function(r){
      if(r.step == sellStep.step){
        success()
      }else{
        error();
      }
    });
}

var savePortfolio = function(portfolio){
  $.ajax({
      method: "POST",
      url: "http://emiliano.bocamuchas.org:5000/api/1.0/portfolio",
      data: {"currentTime": getTimeDescription(), "portfolio": JSON.stringify(portfolio)}
    }).done(function(msg){
      console.info('savePortfolio',msg);
    });
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

sellStartStep = new StepWaiting({
        "timeKey": getTimeDescription(),
        "code": "PETR3",
        "name": "SELL_STEP",
        "step": "start"
       }, function(){
    console.info('Vai Sabrina')
});