const RC = require('rc')('DWBOX', require('./config/default.json'))

exports.common = {
  version: '1.0',
  port: RC.PORT,
  app_secret: RC.APP_SECRET,
  static_dir: 'public',
  rdio: {
    name: RC.RDIO.NAME,
    oauth_url: 'https://www.rdio.com/oauth2/',
    resource_url: 'https://www.rdio.com/api/1/',
    consumer_key: RC.RDIO.CONSUMER_KEY,
    consumer_secret: RC.RDIO.CONSUMER_SECRET
  },
  dwolla: {
    consumer_key: RC.DWOLLA.CONSUMER_KEY,
    consumer_secret: RC.DWOLLA.CONSUMER_SECRET,
    oauth_url: 'https://uat.dwolla.com/oauth/v2/',
    api_url: 'https://uat.dwolla.com/oauth/rest/',
    website_url: 'https://uat.dwolla.com/',
    scope: RC.DWOLLA.SCOPE
  },
  firebase: {
    url: RC.FIREBASE.URL
  }
};

exports.development = {

};

exports.staging = {

};

exports.production = {

};