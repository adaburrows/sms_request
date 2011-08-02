/* sms_request - v0.0.1
 * ----------------------------------------------------------------------------
 * Simple library for interacting with the smsified API asynchronously.
 * Emits events for various reply states.
 * ----------------------------------------------------------------------------
 * This code is being released under an MIT style license:
 *
 * Copyright (c) 2010 Jillian Ada Burrows
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * ------------------------------------------------------------------------------
 * Original Author: Jillian Ada Burrows
 * Email:           jill@adaburrows.com
 * Website:         <http://www.adaburrows.com>
 * Facebook:        <http://www.facebook.com/jillian.burrows>
 * Twitter:         @jburrows
 * ============================================================================
 */

/* Include required libraries */
var events = require('events');
var api_request = require('api_request');

/*
 * Constructor, also inheirits from EventEmitter.
 */
function sms_request(conf) {
  // Call EventEmitter constructor on this context
  events.EventEmitter.call(this);
  var config, v;
  this.config = conf;
  this.v = '/v1';
}
sms_request.super_ = events.EventEmmitter;
sms_request.prototype = Object.create(
  events.EventEmitter.prototype,
  {
    constructor: {
      value: sms_request,
      enumerable: false
    }
  }
);

/*
 * Make a new caller with the right prameters for authenticating to smsified
 */
sms_request.prototype.new_call = function() {
  return new api_request('https', 'api.smsified.com').
             with_basic_auth(this.config.user, this.config.pass);
};

/*
 * Make a 'GET' request to smsified's API
 */
sms_request.prototype.get = function(uri) {
  var self = this;
  this.new_call().
       get(this.v + uri).on('reply', function(reply, res) {
         self.process_reply(reply, res);
       });
};

/*
 * Make a 'POST' request to smsified's API
 */
sms_request.prototype.post = function(uri) {
  var self = this;
  this.new_call().
       with_content_type('application/x-www-form-urlencoded').
       post(this.v + uri).on('reply', function(reply, res) {
         self.process_reply(reply, res);
       });
};

/*
 * Make a 'PUT' request to smsified's API
 */
sms_request.prototype.put = function(uri) {
  var self = this;
  this.new_call().
       with_content_type('application/x-www-form-urlencoded').
       put(this.v + uri).on('reply', function(reply, res) {
         self.process_reply(reply, res);
       });
};

/*
 * Make a 'DELETE' request to smsified's API
 */
sms_request.prototype.del = function(uri) {
  var self = this;
  this.new_call().
       del(this.v + uri).on('reply', function(reply, res) {
         self.process_reply(reply, res);
       });
};

/*
 * Send a message to a SMS enabled number.
 *
 * Takes a object like so:
 * {
 *   'number': 'phoneNumber',
 *   'message': 'Your clothes are ready for pickup from your local neighborhood cleaners.'
 * }
 *
 * Full list of parameters at: http://smsified.com/sms-api-documentation/reference#parameters
 */
sms_request.prototype.send = function(message) {
  var payload = require('querystring').stringify(message);
  this.post(this.v + '/smsmessaging/outbound/'+ this.config.sender + '/requests?' + payload);
};

/*
 * Process the reply and emit events based on the status code from the server.
 * See: http://smsified.com/sms-api-documentation/reference#response_codes
 */
sms_request.prototype.process_reply = function(reply, res) {
  switch (res.statusCode) {
    case 200:
     // OK
    case 201:
     // Created
    case 204:
     // No content
      this.emit('success', reply, res);
      break;
    case 400:
     // Bad request
      this.emit('problem', reply, res);
      break;
    case 401:
     // Unauthorized
      this.emit('auth_error', reply, res);
      break;
    case 404:
     // Not found
      this.emit('problem', reply, res);
      break;
    case 405:
     // Method not allowed
      this.emit('problem', reply, res);
      break;
    case 415:
     // Unsupported Media Type
    case 500:
     // Internal Server Error
    case 503:
     // Server unavailable
    default:
      this.emit('error', reply, res);
      break;
  }
};

module.exports = sms_request;
