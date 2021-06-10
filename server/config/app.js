var express = require('./express');

module.exports.start = function() {
  var app = express.init();
  app.listen(8080, function() {
    console.log('App listening on port', 8080);
  });
  
  // Uncomment if deploying web app to Heroku
  //listen to the port that Heroku sets
  //app.listen(process.env.PORT || 3000, function(){
  //  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  //});
};