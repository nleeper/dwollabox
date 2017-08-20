var uuid = require('node-uuid'),
    fbClient = require('firebase');

var Firebase = function(settings) {
  this._url = settings.url;
}

Firebase.prototype.createUser = function(user) {
    if (user && user.id) {
        var ref = this._getUserRef(user.id);
        ref.set(user);

        return user;
    }
    return null;
}

Firebase.prototype.updateUser = function(id, details, cb) {
    if (id) {
        var ref = this._getUserRef(id);
        ref.update(details, function(err) {
            cb(err);
        });
    }
}

Firebase.prototype.getUser = function(id, cb) {
    if (id) {
        var ref = this._getUserRef(id);
        ref.on('value', function(snapshot) {
            cb(null, snapshot.val());
        });
    }
}

Firebase.prototype._getUserRef = function(id) {
    return this._getRef('users/' + id);
}

Firebase.prototype._getRef = function(ref) {
    return new fbClient(this._url + ref);
}

module.exports = Firebase;