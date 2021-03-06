# node-facebook
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)

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

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="https://fb.com/RemoveU"><img src="https://avatars1.githubusercontent.com/u/19208123?v=4" width="100px;" alt="Hongarc"/><br /><sub><b>Hongarc</b></sub></a><br /><a href="#projectManagement-Hongarc" title="Project Management">📆</a> <a href="#review-Hongarc" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/Hongarc/node-facebook/commits?author=Hongarc" title="Tests">⚠️</a> <a href="https://github.com/Hongarc/node-facebook/commits?author=Hongarc" title="Code">💻</a></td><td align="center"><a href="https://github.com/Schmavery"><img src="https://avatars1.githubusercontent.com/u/2154522?v=4" width="100px;" alt="Avery Morin"/><br /><sub><b>Avery Morin</b></sub></a><br /><a href="#ideas-Schmavery" title="Ideas, Planning, & Feedback">🤔</a></td><td align="center"><a href="http://23phy.github.io"><img src="https://avatars3.githubusercontent.com/u/11774416?v=4" width="100px;" alt="Oliver Cristian"/><br /><sub><b>Oliver Cristian</b></sub></a><br /><a href="#talk-23phy" title="Talks">📢</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!