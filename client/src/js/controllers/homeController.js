'use strict';

//import {GoogleCharts} from 'google-charts';

app.controller('homeController', ['$scope', '$window', '$state', 'listingsFactory',
  function($scope, $window, $state,  listingsFactory) {
    var vm = this;
    vm.amazonScore = 0
    vm.googleScore = 0
    vm.ibmScore = 0
    vm.allData = []
    $scope.seeScores = false
    var isInit = false
    var isAmazonInit = false
    var isGoogleInit = false
    var isIBMInit = false
    var amazonChart;
    var googleChart;
    var ibmChart;

    vm.colorPicker = function(score){
      let color;
      if(score > 0.2){
        color = '#009900' //Green positive
      }
      else if(score < -0.2){
        color = '#c00000' //Red negative
      }
      else{
        color = '#a6a6a6' //Gray neutral
      }
      return color;
    }

    vm.analyze = function(companyName, tweetNumber){
      if(tweetNumber > 100){
        $window.alert("# of Tweets cannot be over 100");
        return;
      }

      $scope.loading=true;
      vm.amazonScore, vm.googleScore, vm.ibmScore = 0

      listingsFactory.getAnalysis(companyName, tweetNumber)
        .then(
          function(response) {
            const results = JSON.parse(response.data);

            vm.allData = results.data
            console.log(results.data)
            for(let data of vm.allData){ //Gets averages of scores
              vm.amazonScore += data.awsScore
              vm.googleScore += data.googleScore
              vm.ibmScore += data.ibmScore
            }
            vm.amazonScore /= vm.allData.length
            vm.googleScore /= vm.allData.length
            vm.ibmScore /= vm.allData.length

            draw(results)
            $scope.seeScores = true
            $scope.loading=false

          }, function(error) {
            // if there was an error with the http request
            console.log("getAll error", error);
          })
    }
    
    function draw(aiResults) {
      //Load google charts

      const options = {
        title: "", //Edit title per chart
        height: 200,
        width: 481,
        backgroundColor: {
            stroke: '#000000',
            strokeWidth: 3
        },
        bar: {groupWidth: "95%"},
        legend: { position: "none" },
        animation: {
          startup: true,
          duration: 3000,
          easing: "out"
        }
      };

      if(isInit){
        drawAmazonChart()
        drawGoogleChart()
        drawIBMChart()
      }

      if(!isInit){
        google.charts.load('current', {'packages':['corechart', 'bar']});
        google.charts.setOnLoadCallback(drawAmazonChart);
        google.charts.setOnLoadCallback(drawGoogleChart);
        google.charts.setOnLoadCallback(drawIBMChart);
        isInit = true;
      }

      
      
      

      // Draw the chart and set the chart values
      function drawAmazonChart() {
        options.title = "Amazon Sentiment"
        const data = google.visualization.arrayToDataTable([
          ['Sentiment', '# of Tweets', { role: 'style' } ],
          ['Positive', aiResults.awsSentimentCounts[0], 'color: #009900'],
          ['Neutral', aiResults.awsSentimentCounts[1], 'color: #a6a6a6'],
          ['Negative', aiResults.awsSentimentCounts[2], 'color: #c00000']
        ]);

        // Display the chart inside the <div> element with id="piechart"
        if(!isAmazonInit){
          amazonChart = new google.visualization.ColumnChart(document.getElementById('amazonchart'));
          isAmazonInit = true
        }
        
        amazonChart.draw(data, options);
      }

      function drawGoogleChart() {
        options.title = "Google Sentiment"
        const data = google.visualization.arrayToDataTable([
          ['Sentiment', '# of Tweets', { role: 'style' } ],
          ['Positive', aiResults.googleSentimentCounts[0], 'color: #009900'],
          ['Neutral', aiResults.googleSentimentCounts[1], 'color: #a6a6a6'],
          ['Negative', aiResults.googleSentimentCounts[2], 'color: #c00000']
        ]);

        // Display the chart inside the <div> element with id="piechart"
        if(!isGoogleInit){
          googleChart = new google.visualization.ColumnChart(document.getElementById('googlechart'));
          isGoogleInit = true
        }
        
        googleChart.draw(data, options);
      }

      function drawIBMChart() {
        options.title = "IBM Sentiment"
        const data = google.visualization.arrayToDataTable([
          ['Sentiment', '# of Tweets', { role: 'style' } ],
          ['Positive', aiResults.ibmSentimentCounts[0], 'color: #009900'],
          ['Neutral', aiResults.ibmSentimentCounts[1], 'color: #a6a6a6'],
          ['Negative', aiResults.ibmSentimentCounts[2], 'color: #c00000']
        ]);

        // Display the chart inside the <div> element with id="piechart"
        if(!isIBMInit){
          ibmChart = new google.visualization.ColumnChart(document.getElementById('ibmchart'));
          isIBMInit = true
        }
        
        ibmChart.draw(data, options);
      }
    }
}]);
