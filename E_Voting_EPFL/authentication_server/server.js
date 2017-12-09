/**
* Authentication Server.
* Takes care of the Tequila authentication and recovers the user's informations
* relative to EPFL.
*/

var express = require('express'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    methodOverride = require('method-override'),
    expressSession = require('express-session'),
    util = require('util'),
    TequilaStrategy = require('passport-tequila').Strategy;
    

const ldapReq = require('./ldapReq.js'),
      schnorrSign = require('./schnorrSign.js');

/** 
  * Serialization and deserialization of the user to support persisten login sessions.
  */
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

// Use the TequilaStrategy within Passport.
var tequila = new TequilaStrategy({
    service: "Tequila Authentification",
    request: ["displayname"],
    function(userKey, profile, done) {
    User.findOrCreate(profile, function (err, user) {
      done(err, user);
    });
  }
});
passport.use(tequila);

// Express configuration
var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(expressSession({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

/** 
  * Initialize Passport and use passport.session() middleware to support
  * persistent login sessions.
  */
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

/**
* Authentication page.
* By being redirected on it, the client will be authentified and when the 
* authentication is valid, an LDAP request will be made to recover his informations
* relative to the EPFL.
*/
app.get('/auth', tequila.ensureAuthenticated, function(req, res){
	console.log("Ici");
    var name = req.user.displayName;
    ldapReq.getUserAttributes(name, function(result){
        
        // Message to be signed
        var signed_message = {
            id : result.sciper
        }

        //Message containing some usefull informations about the user that can be used later to filter the votes.
        var message = {
            id : result.sciper,
            name : req.user.displayName,
            section : result.section,
            groups : result.groups,
            fullDate : new Date().toLocaleString()
        }

        var signature = schnorrSign.signMessage(signed_message);
        res.render('auth', {
            message: message, 
            signed_message : signed_message, 
            signature: signature });
        
    });
});

// To log out, just drop the session cookie.
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

// Alternatively, we can also log out from Tequila altogether.
app.get('/globallogout', tequila.globalLogout("/"));

var portNumber = process.env.PORT || 3000;
app.listen(portNumber);
console.log('Server listening on port ' + portNumber);
