var passportLocal = require('passport-local');
var LocalStrategy = require('passport-local').Strategy;
var passportHttp = require('passport-http');
var User = require('../models/user');

module.exports = function(passport) {
	//passport session setup
	//passport needs to serialize users in and out of session

	function verifyCredentials(username, password, done) {
	    if (username === password) {
	        done(null, { id: username, username: username });
	    } else {
	        done(null, null);
	    }
	}

	//Serialize the user
	passport.serializeUser(function(user, done) {
	    done(null, user.id);
	});

	//Deserialize the user
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	//LOCAL SIGNUP
	passport.use('local-register', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done) {
		process.nextTick(function() {

			User.findOne({ 'email': email }, function(err, user) {
				if (err)
					return done(err);
				if (user) {
					return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
				} else {
					var newUser = User();
					newUser.fullname = req.body.fullname;
					newUser.username = req.body.username;
					newUser.email = req.body.email;
					newUser.password = newUser.generateHash(password);
					console.log(newUser.password);

					newUser.save(function(err) {
						if(err)
							throw err
						return done(null, newUser);
					});
				}

			});
		});
	}));

	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done) {
		process.nextTick(function() {
			User.findOne({ 'email': email }, function(err, user) {
				if (err)
					return done(err);
				if (!user)
					return done(null, false, req.flash('loginMessage', 'No user found.'));
				if(!user.validPassword(password))
					return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
				return done(null, user);
			});
		});
	}));
}