var path = require('path'),  
    express = require('express'), 
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    viewsRouter = require('../routes/views.server.routes'),
    listingsRouter = require('../routes/listings.server.routes')


module.exports.init = function() {
  
  //initialize app
  var app = express();

  //enable request logging for development debugging
  app.use(morgan('dev'));

  //body parsing middleware 
  app.use(bodyParser.json());

  
  /** Serve static files */
  app.use(viewsRouter);
 
  /** Mount the listingsRouter onto the /api/listings route */
  app.use('/api/listings', listingsRouter); 

  return app;
};  