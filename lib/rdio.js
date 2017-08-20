var util = require('util'),
    request = require('request')
    qs = require('querystring');

var Rdio = function(settings, callbackUrl) {
  this._key = settings.consumer_key || '';
  this._secret = settings.consumer_secret || '';
  this._oauthUrl = settings.oauth_url || '';
  this._resourceUrl = settings.resource_url || '';
  this._callbackUrl = callbackUrl;
}

Rdio.prototype.authorize = function(res) {
  var params = { response_type: 'code', client_id: this._key, redirect_uri: this._callbackUrl };
  var authUrl = this._oauthUrl + 'authorize?' + qs.stringify(params);

  res.redirect(authUrl + '?' + qs.stringify(params));
}

Rdio.prototype.getAccessToken = function(code, cb) {
  var params = { grant_type: 'authorization_code', code: code, redirect_uri: this._callbackUrl };
  var tokenUrl = this._oauthUrl + 'token';

  var content = qs.stringify(params);
  var headers = {
                  'Content-Length': content.length.toString(),
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Authorization': util.format('Basic %s', new Buffer(util.format('%s:%s', this._key, this._secret)).toString('base64'))
                };

  request.post({ url: tokenUrl, body: content, headers: headers }, function(err, response, body) {
    if (err) {
      cb(err, null, null);
    }
    else {
      var parsed = JSON.parse(body);
      cb(null, parsed.access_token, parsed.refresh_token);
    }
  });
}

Rdio.prototype.currentUser = function(token, cb) {
  this._call('currentUser', token, { extras: 'isUnlimited' }, cb);
}

Rdio.prototype._call = function(method, token, params, cb) {
  if (typeof params == "function") {
    cb = params;
    params = {};
  }

  params.method = method;

  var content = qs.stringify(params);
  var headers = {
                  'Content-Length': content.length.toString(),
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Authorization': util.format('Bearer %s', token)
                };

  request.post({ url: this._resourceUrl, body: content, headers: headers }, function(err, response, body) {
    if (err) {
      cb(err, null);
    }
    else {
      var parsed = JSON.parse(body);
      cb(null, parsed);
    }
  });
}

module.exports = Rdio;