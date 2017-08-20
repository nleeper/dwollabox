var  _ = require('underscore'),
    qs = require('querystring')
    util = require('util'),
    request = require('request');

var Dwolla = function(settings, callbackUrl) {
  this._key = settings.consumer_key || '';
  this._secret = settings.consumer_secret || '';
  this._oauthUrl = settings.oauth_url || '';
  this._apiUrl = settings.api_url || '';
  this._scope = settings.scope || '';
  this._callbackUrl = callbackUrl;
}

Dwolla.prototype.authenticate = function(res) {
  var params = { response_type: 'code', scope: this._scope, client_id: this._key, redirect_uri: this._callbackUrl };
  var authUrl = this._oauthUrl + 'authenticate?' + qs.stringify(params);

  res.redirect(authUrl);
}

Dwolla.prototype.getAccessToken = function(code, cb) {
  var params = { client_id: this._key, client_secret: this._secret, grant_type: 'authorization_code', code: code, redirect_uri: this._callbackUrl };
  var tokenUrl = this._oauthUrl + 'token?' + qs.stringify(params);

  request.get({ url: tokenUrl }, function(err, response, body) {
    if (err) {
      cb(err, null, null);
    }
    else {
      var parsed = JSON.parse(body);
      cb(null, parsed.access_token);
    }
  });
}

Dwolla.prototype.accountInformation = function(accessToken, cb) {
  this._get({ endpoint: 'users', params: { oauth_token: accessToken } }, cb);
}

Dwolla.prototype.balance = function(accessToken, cb) {
  this._get({ endpoint: 'balance', params: { oauth_token: accessToken } }, cb);
}

Dwolla.prototype._get = function(options, cb) {
  if (!options.endpoint) {
    cb('options.endpoint must be specified!', null);
    return;
  }

  var reqOptions = {};
  var params = options.params || {};

  reqOptions.url = this._apiUrl + options.endpoint + (_.keys(params).length > 0 ? '?' : '') + qs.stringify(params);

  reqOptions.json = options.json || true;

  var parseResponse = true;
  if (options.hasOwnProperty('parseResponse')) {
    parseResponse = options.parseResponse;
  }
  
  var dwolla = this;
  request.get(reqOptions, function(err, response, body) {
    dwolla._apiCallback(err, response, body, function(err, body) {
      if (parseResponse) {
        var responseObj = null;
        if (!err) {
            if (body.Success) {
              responseObj = body.Response;
            }
            else {
              err = body.Message;
            }
        }  
        cb(err, responseObj);
      }
      else {
        cb(err, body);
      }
    });
  });
}

Dwolla.prototype._apiCallback = function(err, response, body, cb) {
  var errorStr = null;
  var bodyObj = null;

  if (!err) {
    bodyObj = body;
  }
  else {
    errorStr = err.message;
  }

  if (errorStr) {
    errorStr = util.format('API error: %s', errorStr);
    console.error(errorStr);
  }

  cb(errorStr, bodyObj);
}

module.exports = Dwolla;