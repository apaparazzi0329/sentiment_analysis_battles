'use strict';

app.factory('listingsFactory', function($http) {

    /**Listing API methods
     *The factory is responsible for making api calls that are then routed
     * to the server-side controllers
     * The methods here will be called by the listingsController
     */

    var methods = {
      getAnalysis: function (companyName, tweetNumber) {
        /**TODO
         * Make http get request to retrieve all listings in database
         */
        console.log("Calling factory.getAnalysis()");
        return $http.get(`http://localhost:8080/api/listings/${companyName}/${tweetNumber}`);
      
      },
    };
  
    return methods;
  });
  