var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

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
        if (event.message && event.message.text) {
          addMessage(event.sender.id, event.message.text);
        }   
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
