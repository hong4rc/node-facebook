# node-facebook

[![CircleCI](https://circleci.com/gh/Hongarc/node-facebook.svg?style=shield&circle-token=c610044c788b4dbe2ed19f9a27a19afc37cacf57)](https://circleci.com/gh/Hongarc/node-facebook)
[![npm version](https://img.shields.io/npm/v/node-facebook.svg?style=flat)](https://npmjs.com/package/node-facebook)

### Documentation
I re-write [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api) to learn, you can goto [facebook-chat-api#documentation](https://github.com/Schmavery/facebook-chat-api#documentation) to read documentation of that module.
Thank you so much [Schmavery](https://github.com/Schmavery/)

Check [wiki](https://github.com/Hongarc/node-facebook/wiki).

### Feature
This module have function same you use browser.

### Usage
Change in `test.js`
- In first time, you should login with email and password:
```js
let user = {email: 'your username/id', pass: 'your pass'};
```
- When you logged in, use `api.getAppState()` to save cookie with this code:
```js
fs.writeFileSync('state.json', JSON.stringify(api.getAppState()));
```
- Now, you can login with cookie with file `state.json`:
```js
user = {appState: JSON.parse(fs.readFileSync('state.json', 'utf8'))};
```
or use environment variable to login.

### Example
[kiat-bot](https://github.com/Hongarc/kiat-bot) is sample use [node-facebook](https://github.com/Hongarc/node-facebook)
