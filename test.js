'use strict';
const fs = require('fs');
const request = require('request');

let login = require('./index');
let timer = require('./timer');

// let user = {email: 'your username/id', pass: 'your pass'};
let user = process.env.user;
if (user) {
    user = {appState: JSON.parse(user)}
} else {
    user = {appState: JSON.parse(fs.readFileSync('state.json', 'utf8'))};
}

let last_typing = [0, 0, 0, 0];

const TIME_OUT_MSG = 30000;
const TIME_IdLING = 600000;
const URL_IdLING = process.env.URL_IdLING;
login(user)
    .then(api => {
        // fs.writeFileSync('state.json', JSON.stringify(api.getAppState()));
        let stopper = {};
        api.listen((err, msg) => {
            if (err) {
                console.log(err);
            }
            switch (msg.type) {
                case 'presence':
                    console.log(msg.userId, msg.statUser ? 'online' : 'idle');
                    if (msg.statUser) {
                        let nowHour = timer.getCurrentTime().getHours();
                        if (nowHour >= 1 && nowHour <= 3) {
                            api.sendMessage('Chào bạn buổi sáng tốt lành, chúc ngủ ngon !!!', msg.userId);
                        }
                    }
                    break;
                case 'typ':
                    let from = msg.from;
                    if (msg.isTyping) {
                        console.log(from + ' is typing.');
                        let index = last_typing.indexOf(from);
                        if (index > -1) {
                            last_typing.splice(index, 1);
                        } else {
                            last_typing.shift();
                        }
                        last_typing.push(from);
                        stopper[from] = api.sendTyping(from);
                        setTimeout(() => {
                            delete stopper[from]
                        }, TIME_OUT_MSG);

                    } else {
                        console.log(from + ' is not typing.');
                        if (stopper[from]) {
                            stopper[from]();
                        }
                    }
                    break;
                default:
                    console.log(msg);

            }
        });
    });


//For server
let express = require('express');
let app = express();

let port = process.env.PORT || 1997;
app.listen(port, () => console.log('This app is running in Port: ' + port));
app.get('/', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/json; charset=utf-8'
    });
    let data = {
        isRunning: true,
        last_typing: last_typing.filter(val => val)
    };
    res.end(JSON.stringify(data, null, 4))
});
URL_IdLING && setInterval(() => {
    request(URL_IdLING, (err, res) => {
        if (res && res.statusCode === 200) {
            console.log('Trigger success !!!')
        }
    });
}, TIME_IdLING);