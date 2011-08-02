sms_request
===========

This is a library for sending asynchronous requests to the smsified API. It provides full error reporting. Version 0.0.1 only supports sending sms messages, but not any other parts of the API. You can specify callbacks to a URL you specify for a delivery report.

Installing
----------

Not in the npm public listing yet. Clone the repo. In your project directory type:
```
npm install $whatever_path_to_repo_you_cloned
```

Usage
-----

Here is an example of using it to send an sms message:

```js
var sms_request = require('sms_request');
var config = require('./config.js');

var message = {
  'address': '11234567890',
  'message': 'Testing...'
};

var req = new sms_request(config.smsified_config);
req.send(message);
req.on('success', function (data, res) {
  console.log("Success:", data['resourceReference']['resourceURL']);
});
req.on('problem', function (data) {
  var error = data['requestError']['serviceException'];
  console.error("Problem:", error['messageId'], error['text']);
});
req.on('auth_error', function(data) {
  console.error("Authorization Error: User name or password is incorrect.");
});
req.on('error', function(data) {
  console.error("Error:", data);
});
```

To send messages out to multiple phone numbers in one shot, just make the `'address'` field an array like so:
```js
var message = {
  'address': ['11234567890','1415123456'],
  'message': 'Testing...'
};
```

The `config.js` file looks like this:

```js
var config = {
  smsified_config: {'user':'username','pass':'password','sender':'11234567890'}
};

module.exports = config;
```

To receive messages, check out [the original smsified nodejs client readme](https://github.com/smsified/smsified-node/blob/master/README.md).
