var express = require('express'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    settings = require('settings'),
    middleware = require('./lib/middleware')
    routes = require('./routes/index'),
    oauthRoutes = require('./routes/oauth'),
    dwollaRoutes = require('./routes/dwolla');

var app = express();

// Load the config file.
if (!global.hasOwnProperty('projectDir')) {
  global.projectDir = __dirname;
}

if (!global.hasOwnProperty('config')) {
  global.config = new settings(path.join(global.projectDir, 'config.js'));
}

// view engine setup
app.set('views', path.join(global.projectDir, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({ secret: global.config.app_secret }));
app.use(middleware.loggedIn());
app.use(middleware.currentUser());
app.use(express.static(path.join(__dirname, global.config.static_dir)));

// Load routes.
app.use('/', routes);
app.use('/oauth', oauthRoutes);
app.use('/dwolla', dwollaRoutes);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(config.port, function() {
    console.log('Listening on port %d', server.address().port);
});


module.exports = app;
