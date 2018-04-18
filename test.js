'use strict';
const fs = require('fs');
const request = require('request');
const log = require('./utils/log');
const login = require('./index');

// const timer = require('./timer');

// let user = {email: 'your username/id', pass: 'your pass'};
let user = process.env.user;
if (user) {
    user = {appState: JSON.parse(user)};
} else {
    user = {appState: JSON.parse(fs.readFileSync('state.json', 'utf8'))};
}
const FIRST = 0;
const ONE = 1;
const SPACE_INDENT = 4;
const MAX_TYPING_SAVED = 4;
const TIME_OUT_MSG = 30000;
const TIME_IdLING = 600000;
const lastTypings = new Array(MAX_TYPING_SAVED);
const URL_IdLING = process.env.URL_IdLING;
login(user)
    .then(api => {

        // fs.writeFileSync('state.json', JSON.stringify(api.getAppState()));
        const stopper = {};
        api.listen((err, msg) => {
            if (err) {
                log.error(err);
            }
            let index,
                from;
            switch (msg.type) {
                case 'presence':
                    log.info(msg.userId, msg.statUser ? 'online' : 'idle');

                    // if (msg.statUser) {
                    //     let nowHour = timer.getCurrentTime().getHours();
                    //     if (nowHour >= 1 && nowHour <= 3) {
                    //         api.sendMessage('Chào bạn buổi sáng tốt lành, chúc ngủ ngon !!!', msg.userId);
                    //     }
                    // }
                    break;
                case 'typ':
                    from = msg.from;
                    if (msg.isTyping) {
                        log.info(`${from} is typing.`);
                        index = lastTypings.indexOf(from);
                        if (index >= FIRST) {
                            lastTypings.splice(index, ONE);
                        } else {
                            lastTypings.shift();
                        }
                        lastTypings.push(from);
                        stopper[from] = api.sendTyping(from);
                        setTimeout(() => {
                            delete stopper[from];
                        }, TIME_OUT_MSG);

                    } else {
                        log.info(`${from} is not typing.`);
                        if (stopper[from]) {
                            stopper[from]();
                        }
                    }
                    break;
                default:
                    log.info(msg);

            }
        });
    });


// For server
const express = require('express');
const app = express();

const DEFAULT_PORT = 1997;
const STT_CODE_OK = 200;
const port = process.env.PORT || DEFAULT_PORT;
app.listen(port, () => log.info(`This app is running in Port: ${port}`));
app.get('/', (req, res) => {
    res.writeHead(STT_CODE_OK, {
        'Content-Type': 'text/json; charset=utf-8'
    });
    const data = {
        isRunning: true,
        last_typing: lastTypings.filter(val => val)
    };
    res.end(JSON.stringify(data, null, SPACE_INDENT));
});
URL_IdLING && setInterval(() => {
    request(URL_IdLING, (error, res) => {
        if (res && res.statusCode === STT_CODE_OK) {
            log.info('Trigger success !!!');
        }
    });
}, TIME_IdLING);
