var firebase = require('./firebase');

var oauthPath = '/oauth/rdio';

function canIgnorePath(path) {
    var publicIgnore = [ '/fonts', '/images', '/javascripts', '/stylesheets', '/logout', '/invalid' ];
    for (var x in publicIgnore) {
        if (path.indexOf(publicIgnore[x]) == 0)
            return true;
    }
    return false;
}

function canSkipOauth(req) {
    return req.cookies.userId || (req.path.indexOf(oauthPath) == 0);
}

module.exports.loggedIn = function() {
    return function(req, res, next) {
        if (!canIgnorePath(req.path)) {
            if (canSkipOauth(req)) {
                next();
            }
            else {
                res.redirect(oauthPath);
            }
        }
        else {
            next();
        }
    }
}

module.exports.currentUser = function() {
    return function(req, res, next) {
        if (!canIgnorePath(req.path)) {
            if (req.cookies.userId) {
                if (!req.session.user) {
                    var firebaseClient = new firebase({ url: global.config.firebase.url });
                    firebaseClient.getUser(req.cookies.userId, function(err, data) {
                        console.log('on current user, getting user');
                        req.session.user = data;
                        next();
                    });
                }
                else {
                    next();
                }
            }
            else {
                next();
            }
        }
        else {
            next();
        }
    }
}