# node-facebook

[![Greenkeeper badge](https://badges.greenkeeper.io/Hongarc/node-facebook.svg)](https://greenkeeper.io/)

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![CircleCI][circleci-image]][circleci-url]

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 10.0 or higher is required.

Installation is done using `npm` or `yarn`:

```bash
$ npm install node-facebook
or
$ yarn add node-facebook
```

Follow [node-facebook's wiki](https://github.com/Hongarc/node-facebook/wiki)
for more information.

### Feature

This module have function same you use browser.

### Usage

- In first time, you should login with email and password:

- When you logged in, use `api.getAppState()` to save cookie with this code:

```js
const login = require('node-facebook');
let user = {email: 'your username/id', pass: 'your pass'};
login(user)
    .then(api => {
        // you can use api here

        // Save cookie to `.json` file
        fs.writeFileSync('state.json', JSON.stringify(api.getAppState()));
    });
```

- Now, you can login with cookie with file `state.json`:

```js
user = {appState: JSON.parse(fs.readFileSync('state.json', 'utf8'))};
```

or use environment variable to login.

### Example

[kiat-bot](https://github.com/Hongarc/kiat-bot) is sample use [node-facebook](https://github.com/Hongarc/node-facebook)

## Credits

`node-facebook` has been inspired by [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api)
Thanks to [Avery Morin](https://github.com/Schmavery) for excellent prior art !

[npm-image]: https://img.shields.io/npm/v/node-facebook.svg
[npm-url]: https://npmjs.org/package/node-facebook
[downloads-image]: https://img.shields.io/npm/dm/node-facebook.svg
[downloads-url]: https://npmjs.org/package/node-facebook
[circleci-image]: https://circleci.com/gh/Hongarc/node-facebook.svg?style=shield&circle-token=c610044c788b4dbe2ed19f9a27a19afc37cacf57
[circleci-url]: https://circleci.com/gh/Hongarc/node-facebook
