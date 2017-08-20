var dwollaClient = require('../lib/dwolla'),
    firebase = require('../lib/firebase'),
    express = require('express'),
    router = express.Router();

/* GET home page. */
router.get('/balance', function(req, res) {
	if (req.session.user && req.session.user.dwolla) {
		console.log('getting dwolla balance');

		var dwolla = new dwollaClient(global.config.dwolla);
		dwolla.balance(req.session.user.dwolla.accessToken, function(err, balanceData) {
			if (err) {
        console.log(err);
        throw new Error('Error getting Dwolla balance');
      }

      var dwollaUser = req.session.user.dwolla;

      dwollaUser.balance = parseFloat(balanceData);

      console.log('setting dwolla balance info in firebase');

      var firebaseClient = new firebase({ url: global.config.firebase.url });
      firebaseClient.updateUser(req.session.user.id, { dwolla: dwollaUser }, function(err) {
      	if (err) {
      		console.log(err);
      		throw new Error('Error saving Dwolla balance');
      	}

      	console.log('setting dwolla balance info in session');

      	req.session.user.dwolla = dwollaUser;

      	console.log('redirecting to settings');

      	res.redirect('/settings');
      });
		});
	}
	else {
    res.redirect('/logout');
  }
});

module.exports = router;