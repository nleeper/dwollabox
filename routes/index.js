var express = require('express'),
    router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { 
  	title: 'dwollabox', 
  	user: req.session.user, 
  	client_id: global.config.rdio.consumer_key,
  	access_token: req.session.user.rdio.accessToken });
});

router.get('/settings', function(req, res) {
  res.render('settings', { title: 'dwollabox', user: req.session.user });
});

router.get('/logout', function(req, res) {
  res.clearCookie('userId');
  res.redirect('https://www.rdio.com/signout');
});

router.get('/invalid', function(req, res) {
	res.render('invalid', { title: 'dwollabox' });
});

module.exports = router;
