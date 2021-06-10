'use strict';

// Register App
const app = angular.module('app', ['ui.router']);

app.config(['$stateProvider',
function config($stateProvider) {
    // Configure stateProvider stuff for listing-details routing
    $stateProvider
        .state('listing-details', {
            url: '/listing-details/:lid'
            
        })
                
}])