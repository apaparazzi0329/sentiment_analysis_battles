const AWS = require('aws-sdk');
const Comprehend = new AWS.Comprehend({apiVersion: '2017-11-27',
                                       region: 'us-east-2',
                                       accessKeyId: process.env.accessKeyIdAWS,
                                       secretAccessKey: process.env.secretAccessKeyAWS
                                      });

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const NLUurl = `https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/a373b6ad-f859-45ab-95fe-5454a8cae6a4`
const NLU = new NaturalLanguageUnderstandingV1({version: '2019-07-12',
                                                authenticator: new IamAuthenticator({apikey: process.env.apikeyNLU,}),
                                                url: NLUurl,
                                              });

const language = require('@google-cloud/language');
const keyFilename = './gAuth.json'
const gNL = new language.LanguageServiceClient({keyFilename});

const Twit = require('twit');

var COUNT = 0;

/* Show the current listing */
exports.AISentimentAnalysis = function(req, res) {
  console.log('We in here')
    const T = new Twit({
      consumer_key:         process.env.consumerKeyTwit,
      consumer_secret:      process.env.consumerSecretTwit,
      access_token:         process.env.accessTokenTwit,
      access_token_secret:  process.env.accessTokenSecretTwit,
      timeout_ms:           30*1000,  // optional HTTP request timeout to apply to all requests.
    })

    const jsonResponse = {
      awsSentimentCounts: [0,0,0], //0:Positive 1:Neutral 2:Negative
      googleSentimentCounts: [0,0,0],
      ibmSentimentCounts: [0,0,0],
      data: []
    }

    const companyName = req.param('companyName');
    const tweetNumber = req.param('tweetNumber');

    T.get('search/tweets', {q: `@${companyName} -filter:retweets -filter:replies`, lang: 'en', count: parseInt(tweetNumber), tweet_mode: 'extended'}, async function(err, data, response) {
      if(err){
        response.status(404).send('Not found')
        console.log('There was an error')
        throw err
      }
      else{
        for(status of data.statuses){
          const full_text = status.full_text
          let cleanedTweet = cleanTweets(full_text)
  
          const results = await allAIAnalysis(cleanedTweet, status) 
          console.log(`Got the str: ${results.tweet}`)
          
          jsonResponse.awsSentimentCounts[results.awsLabel]++
          jsonResponse.googleSentimentCounts[results.googleLabel]++
          jsonResponse.ibmSentimentCounts[results.ibmLabel]++

          

          jsonResponse.data.push({
            tweet: results.tweet,
            node: results.nodeNumber,
            awsScore: results.awsScore,
            googleScore: results.googleScore,
            ibmScore: results.ibmScore
          })

          
        }
        return res.json(JSON.stringify(jsonResponse))
      } 
    })
}

function cleanTweets(tweet_text){
    //const firstFilter = tweet_text.replace(/@\w+/g, '') //Takes out any @ symbols
    const firstFilter = tweet_text.replace(/\s+http(\S+)/g, '') //Takes out any links
    const finalFilter = firstFilter.replace(/\&amp/g, 'and')
    return finalFilter
}
function newLineRemover(text){
    const filtered_text = text.replace(/[\r\n]+/gm, '') //Takes out any newlines for export to excel
    return filtered_text
}

async function allAIAnalysis(text, status){
  //Amazon
  const awsResults = await awsSentimentAnalysis(text)
  const awsSentiment = awsResults.Sentiment
  const awsRawScores = awsResults.SentimentScore
  let awsLabel = 0

  //Standardizing of Amazon scores
  if(awsSentiment == 'POSITIVE'){
    var awsRawScore = `${awsSentiment}: ${awsRawScores.Positive}`
    var awsScore = awsRawScores.Positive
    awsLabel = 0
  }
  else if(awsSentiment == 'NEGATIVE'){
    var awsRawScore = `${awsSentiment}: ${awsRawScores.Negative}`
    var awsScore = awsRawScores.Negative * -1
    awsLabel = 2
  }
  else if (awsSentiment == 'NEUTRAL'){
    var awsRawScore = `${awsSentiment}: ${awsRawScores.Neutral}`
    if(awsRawScores.Neutral >= 0.90)
      var awsScore = 0
    else{
      var awsScore = 0 + (awsRawScores.Positive + (awsRawScores.Negative * -1))
      if(awsScore > 0.2)
        awsScore = 0.2
      else if(awsScore < -0.2)
        awsScore = -0.2
    }
    
    awsLabel = 1
  }
  else if(awsSentiment == 'MIXED'){
    if(awsRawScores.Mixed >= 0.90)
      var awsScore = 0
    else{
      var awsScore = 0 + (awsRawScores.Positive + (awsRawScores.Negative * -1))
      if(awsScore > 0.2)
        awsScore = 0.2
      else if(awsScore < -0.2)
        awsScore = -0.2
    }

    awsLabel = 1
  }

  //IBM
  const ibmResults = await watsonSentimentAnalysis(text)
  const ibmScore = ibmResults.result.sentiment.document.score
  const ibmRawLabel = ibmResults.result.sentiment.document.label

  let ibmLabel  = 0
  if(ibmRawLabel == 'positive')
    ibmLabel = 0
  else if (ibmRawLabel == 'neutral')
    ibmLabel = 1
  else if (ibmRawLabel == 'negative')
    ibmLabel = 2

  //Google
  const googleResults = await googleSentimentAnalysis(text)
  const googleScore = googleResults.score
  const googleMagnitude = googleResults.magnitude

  let googleLabel = 0
  if(googleScore < 0.21 && googleScore > -0.21)
    googleLabel = 1
  else if(googleScore >= 0.21)
    googleLabel = 0
  else 
    googleLabel = 2


  const tweetForExport = newLineRemover(text)

  const jsonResponse = {
    awsLabel: awsLabel,
    googleLabel: googleLabel,
    ibmLabel: ibmLabel,
    tweet: tweetForExport,
    nodeNumber: status.id_str,
    awsScore: awsScore,
    googleScore: googleScore,
    ibmScore: ibmScore
  }

  return jsonResponse
}

async function googleSentimentAnalysis(text){
    const document = {
        content: text,
        type: 'PLAIN_TEXT',
        language: 'EN',
      };
    
      // Detects the sentiment of the text
      const [result] = await gNL.analyzeSentiment({document: document});
      const sentiment = result.documentSentiment;

      return sentiment
}

async function watsonSentimentAnalysis(text){
    const analyzeParams = {
        'text': text,
        'features': {
          'sentiment': {
          }
        },
        'language': 'en'
      };

    try{
      const analysisResults = await NLU.analyze(analyzeParams)
      return analysisResults
    }
    catch(error){
      console.log('error:', error);
      return error
    }

      
}

async function awsSentimentAnalysis(text){
    var params = {
        LanguageCode: 'en', /* required */
        Text: text /* required */
    };

    try{
      const request = Comprehend.detectSentiment(params)
      const data = await request.promise()
      return data
    }
    catch(error){
      console.log('error: ', error)
      return error
    }
}
