var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

var Forecast = require('forecast');
// Initialize 
var forecast = new Forecast({
  service: 'darksky',
  key: 'f0ad1b95c9fc6c9d0635c5b8a99f0b06',
  units: 'celcius',
  cache: true,
  ttl: {
    http://momentjs.com/docs/#/durations/creating/ 
    minutes: 27,
    seconds: 45
  }
});


// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

app.get('/forecast', function (req, res) {
    forecast.get([35.9335, 139.6181], function(err, weather) {
      if(err) return console.dir(err);
      console.dir(weather);
      console.dir(weather.latitude);
      console.log("weather.latitude " + weather.latitude);
      console.log("오늘 " + weather.timezone + "의 날씨는 " + weather.currently.summary + "입니다. ");
    });
    res.send('forecast');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'abcd_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
//      phase 1.
//        if (event.message && event.message.text) {
//            sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
//        }

//      phase 2.
//        if (event.message && event.message.text) {
//            if (!kittenMessage(event.sender.id, event.message.text)) {
//                sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
//            }
//        } else if (event.postback) {
//            console.log("Postback received: " + JSON.stringify(event.postback));
//        }
      
//      phase 3.
        if (event.message && event.message.text) {
          addMessage(event.sender.id, event.message.text);
        }
      
//      phase 4.
//          if (event.message && event.message.text) {
//              weatherMessage(event.sender.id, event.message.text);
//          }       
    }
    res.sendStatus(200);
});

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

// send rich message with kitten
function kittenMessage(recipientId, text) {
    
  text = text || "";
  var values = text.split(' ');

  if (values.length === 3 && values[0] === 'kitten') {
      if (Number(values[1]) > 0 && Number(values[2]) > 0) {

          var imageUrl = "https://placekitten.com/" + Number(values[1]) + "/" + Number(values[2]);

          message = {
              "attachment": {
                  "type": "template",
                  "payload": {
                      "template_type": "generic",
                      "elements": [{
                          "title": "Kitten",
                          "subtitle": "Cute kitten picture",
                          "image_url": imageUrl ,
                          "buttons": [{
                              "type": "web_url",
                              "url": imageUrl,
                              "title": "Show kitten"
                              }, {
                              "type": "postback",
                              "title": "I like this",
                              "payload": "User " + recipientId + " likes kitten " + imageUrl,
                          }]
                      }]
                  }
              }
          };

          sendMessage(recipientId, message);

          return true;
      }
  }

  return false;
    
};

// send rich message with kitten
function addMessage(recipientId, text) {
    
  text = text || "";
  var values = text.split(' ');

  if (values.length === 3 && values[0] === 'add') {
      if (Number(values[1]) > 0 && Number(values[2]) > 0) {
          addText = values[1] + " + " + values[2] + " = " + (Number(values[1]) + Number(values[2]));
          message = {text: addText};
          sendMessage(recipientId, message);
      }
  }
};

function weatherMessage(recipientId, text){
  text = text || "";
  var values = text.split(' ');

  if (values[0] === '날씨') {
    forecast.get([35.9335, 139.6181], function(err, weather) {
      console.log(weather);
      weatherText = "오늘 " + weather.timezone + "의 날씨는 " + weather.currently.summary + "입니다. ";
      message = {text: weatherText};
      sendMessage(recipientId, message);
    });
  } 
}

