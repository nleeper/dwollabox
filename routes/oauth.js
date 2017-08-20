var rdioClient = require('../lib/rdio'),
    dwollaClient = require('../lib/dwolla'),
    firebase = require('../lib/firebase'),
    util = require('util'),
    express = require('express'),
    router = express.Router();

function getCallbackUrl(req, type) {
  return util.format('%s://%s/oauth/%s/callback', req.protocol, req.get('host'), type);
}

function checkOauthExists(req, type) {
  return req.session.user && req.session.user.hasOwnProperty(type);
}

router.get('/rdio', function(req, res) {
  if (checkOauthExists(req, 'rdio')) {
    console.log('OAuth already linked for Rdio');
    res.redirect('/');
    return;
  }

  var rdio = new rdioClient(global.config.rdio, getCallbackUrl(req, 'rdio'));
  rdio.authorize(res);
});

router.get('/rdio/callback', function(req, res) {
  var code = req.query.code;

  if (code) {
    var rdio = new rdioClient(global.config.rdio, getCallbackUrl(req, 'rdio'));
    rdio.getAccessToken(code, function(err, accessToken, refreshToken) {
      if (err) {
        console.log(err);
        throw new Error('Error getting access token from Rdio');
      }

      rdio.currentUser(accessToken, function(err, data) {
        if (err) {
          console.log(err);
          throw new Error('Error getting Rdio currentUser');
        }

        var rdioUser = data.result;

        if (rdioUser.isUnlimited) {

          var firebaseClient = new firebase({ url: global.config.firebase.url });

          var user = {
            id: rdioUser.key,
            first: rdioUser.firstName,
            last: rdioUser.lastName,
            gender: rdioUser.gender,
            rdio: {
              firstName: rdioUser.firstName,
              lastName: rdioUser.lastName,
              avatar: rdioUser.icon,
              url: rdioUser.url,
              accessToken: accessToken,
              refreshToken: refreshToken
            }
          };

          firebaseClient.createUser(user);

          req.session.user = user;
          res.cookie('userId', user.id);
          res.redirect('/');
        }
        else {
          console.log(util.format('Rdio account must be unlimited: %s', JSON.stringify(rdioUser)));
          res.redirect('/invalid');
        }
      });
    });
  }
  else {
    res.redirect('/logout');
  }
});

router.get('/dwolla', function(req, res) {
  if (checkOauthExists(req, 'dwolla')) {
    console.log('OAuth already linked for Dwolla');
    res.redirect('/');
    return;
  }

  var dwolla = new dwollaClient(global.config.dwolla, getCallbackUrl(req, 'dwolla'));
  dwolla.authenticate(res);
});

router.get('/dwolla/callback', function(req, res) {
  var code = req.query.code;

  if (code) {
    var dwolla = new dwollaClient(global.config.dwolla, getCallbackUrl(req, 'dwolla'));

    dwolla.getAccessToken(code, function(err, accessToken) {
      if (err) {
        console.log(err);
        throw new Error('Error getting access token from Dwolla');
      }

      if (req.session.user) {
        dwolla.accountInformation(accessToken, function(err, data) {
          if (err) {
            console.log(err);
            throw new Error('Error getting Dwolla accountInformation');
          }

          var dwollaDetails = { 
            id: data.Id, 
            name: data.Name, 
            type: data.Type, 
            city: data.City, 
            state: data.State, 
            accessToken: accessToken, 
            balance: 0.0,
            avatar: global.config.dwolla.website_url + 'avatars/' + data.Id + '/50'
          };

          console.log('setting dwolla account info in firebase');

          var firebaseClient = new firebase({ url: global.config.firebase.url });
          firebaseClient.updateUser(req.session.user.id, { dwolla: dwollaDetails }, function(err) {
            if (err) {
              console.log(err);
              throw new Error('Error saving Dwolla account information');
            }

            console.log('setting dwolla account info in session');

            req.session.user.dwolla = dwollaDetails;

            console.log('redirecting to get dwolla balance');

            res.redirect('/dwolla/balance');
          });
        });
      }
      else {
        res.redirect('/logout');
      }
    });
  }
  else {
    res.redirect('/logout');
  }
});

module.exports = router;