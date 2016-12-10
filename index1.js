var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('잘돈다.');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    console.log(req.query['hub.verify_token']);
    if (req.query['hub.verify_token'] === 'abcd_verify_token') {    // webhook 설정에 입력된 토큰
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});