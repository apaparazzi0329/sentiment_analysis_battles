// This router is for the webpages that will be displayed to screen and all of its dependencies.

/** Useful Note:
 *  app.get('/?debug=true', routes.index); 
 *  will be treated exactly as app.get('/', routes.index);.
 * */

/* Dependencies */
var path = require('path'),
    express = require('express'), 
    router = express.Router();

    
    
    
/* Home Page & Dependencies */
router.get('/', function(req, res){
    res.sendFile(path.resolve(__dirname+'/../../client/src/components/home/home.html'));
});
router.get('/main.css', function(req, res){
    res.sendFile(path.resolve(__dirname+'/../../client/src/components/home/main.css'));
});
router.get('/js/app.js', function(req, res){
    res.sendFile(path.resolve(__dirname+'/../../client/src/js/app.js'));
});
router.get('/js/homeController.js', function(req, res){
    res.sendFile(path.resolve(__dirname+'/../../client/src/js/controllers/homeController.js'));
});
router.get('/js/listingsFactory.js', function(req, res){
    res.sendFile(path.resolve(__dirname+'/../../client/src/js/factories/listingsFactory.js'))
});
router.get('/img/background.png', function(req, res){
    res.sendFile(path.resolve(__dirname+'/../../client/img/background.png'));
});
router.get('/img/favicon.png', function(req, res){
    res.sendFile(path.resolve(__dirname+'/../../client/img/favicon.png'));
});
router.get('/img/amazon_loading.gif', function(req, res){
    res.sendFile(path.resolve(__dirname+'/../../client/img/amazon_loading.gif'));
});
router.get('/img/google_loading.gif', function(req, res){
    res.sendFile(path.resolve(__dirname+'/../../client/img/google_loading.gif'));
});
router.get('/img/ibm_loading.gif', function(req, res){
    res.sendFile(path.resolve(__dirname+'/../../client/img/ibm_loading.gif'));
});




/* Images */


module.exports = router;