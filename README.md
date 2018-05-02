# fb-chat-emulator

### Documentation
I re-write [this module](https://github.com/Schmavery/facebook-chat-api) to learn, you can goto [here](https://github.com/Schmavery/facebook-chat-api#documentation) to read documentation of that module.
Thank you so much [Schmavery](https://github.com/Schmavery/)

### Feature
This module will auto online 24/24 and "seen" if somebody send you any message.
Run test.js to auto send typing when they are typing to you.

### Usage
Change in `test.js`
- In first time, you should login with email and password with [this code](https://github.com/Hongarc/fb-chat-emulator/blob/7836f64fb38de3eb91e798f7b93c9bd9c5b640b2/test.js#L10):
```js
let user = {email: 'your username/id', pass: 'your pass'};
```
- When you logged in, use [this code](https://github.com/Hongarc/fb-chat-emulator/blob/7836f64fb38de3eb91e798f7b93c9bd9c5b640b2/test.js#L22) to save cookie:
```js
fs.writeFileSync('state.json', JSON.stringify(api.getAppState()));
```
- Now, you can login with cookie with file `state.json` [here](https://github.com/Hongarc/fb-chat-emulator/blob/7836f64fb38de3eb91e798f7b93c9bd9c5b640b2/test.js#L15):
```js
user = {appState: JSON.parse(fs.readFileSync('state.json', 'utf8'))};
```
or use environment variable to login [here](https://github.com/Hongarc/fb-chat-emulator/blob/7836f64fb38de3eb91e798f7b93c9bd9c5b640b2/test.js#L11):
```js
user = process.env.user
```

### Deploy with Heroku (or like that)
You should create some environment variable :
- `user`: variable to login and don't show in source (recommend).
- `TIME_IDLING`: timeout request to your server.
- `BASE_URL`: your domain.
- `LOG_TIMEOUT`: timeout to send log file.
- `LOG_THREAD_ID`: id of user receive file log.
- Go to [here](https://github.com/Hongarc/fb-chat-emulator/tree/7836f64fb38de3eb91e798f7b93c9bd9c5b640b2) to view how to auto change server.