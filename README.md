# node-facebook

  [![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]
  [![FOSSA Status shield][fossa-image-shield]][fossa-url]
  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![License][license-image]][license-url]

  [![Travis][travis-image]][travis-url]
  [![Codecov][codecov-image]][codecov-url]
  [![Code style][airbnb-image]][airbnb-url]
  [![CodeFactor][codefactor-image]][codefactor-url]


  [![FOSSA Status large][fossa-image-large]][fossa-url]

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).

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

- When you logged in, use `api.getState()` to save cookie with this code:

```js
const fs = require('fs');
const Facebook = require('node-facebook');

const me = new Facebook({email: 'your username/id', pass: 'your pass'});
me.login()
  .then((api) => {
    fs.writeFileSync('state.json', JSON.stringify(api.getState()));
  });
```

- Now, you can login with cookie with file `state.json`:

```js
const me = new Facebook({state: JSON.parse(fs.readFileSync('state.json', 'utf8'))});
```

### Example

[kiat-bot](https://github.com/Hongarc/kiat-bot) is sample use [node-facebook](https://github.com/Hongarc/node-facebook)

## Credits

`node-facebook` has been inspired by [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api)
Thanks to [Avery Morin](https://github.com/Schmavery) for excellent prior art !

[npm-image]: https://img.shields.io/npm/v/node-facebook.svg
[npm-url]: https://npmjs.org/package/node-facebook
[downloads-image]: https://img.shields.io/npm/dm/node-facebook.svg
[downloads-url]: https://npmjs.org/package/node-facebook
[travis-image]: https://travis-ci.com/Hongarc/node-facebook.svg?branch=develop
[travis-url]: https://travis-ci.com/Hongarc/node-facebook
[greenkeeper-image]: https://badges.greenkeeper.io/Hongarc/node-facebook.svg
[greenkeeper-url]: https://greenkeeper.io/
[codecov-image]: https://codecov.io/gh/Hongarc/node-facebook/branch/develop/graph/badge.svg
[codecov-url]: https://codecov.io/gh/Hongarc/node-facebook
[airbnb-image]: https://img.shields.io/badge/code%20style-airbnb-ff69b4.svg?logo=airbnb
[airbnb-url]: https://github.com/airbnb/javascript
[license-image]: https://img.shields.io/github/license/Hongarc/node-facebook.svg?color=blueviolet
[license-url]: https://github.com/Hongarc/node-facebook/blob/develop/LICENSE
[codefactor-image]: https://www.codefactor.io/repository/github/hongarc/node-facebook/badge
[codefactor-url]: https://www.codefactor.io/repository/github/hongarc/node-facebook

[fossa-image-shield]: https://app.fossa.io/api/projects/git%2Bgithub.com%2FHongarc%2Fnode-facebook.svg?type=shield
[fossa-image-large]: https://app.fossa.io/api/projects/git%2Bgithub.com%2FHongarc%2Fnode-facebook.svg?type=large
[fossa-url]: https://app.fossa.io/projects/git%2Bgithub.com%2FHongarc%2Fnode-facebook
