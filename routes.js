var User = require('./models/user');

module.exports = function(app, router, passport) {
	//Rendering pages
	router.get('/', ensureAuthenticated, function(req, res, next) {
		res.render('home', { title: 'BumpIt',
			user: req.user
		});
	});

	router.get('/signin', checkForSignUpRedirect, function(req, res, next) {
		res.render('signin');
	});

	router.get('/logout', function(req, res) {
	    req.logout();
	    res.redirect('/');
	});

	router.post('/login', passport.authenticate('local-login', {
		successRedirect: '/',
		failureRedirect: '/signin',
		failureFlash: true
	}));

	router.post('/register', passport.authenticate('local-register', {
		successRedirect: '/',
		failureRedirect: '/signin',
		failureFlash: true
	}));

	//On event
	router.post('/follow', followUser, function(req, res, next) {
		res.send(202);
	});

	//HTML AUTHENTICATION IMPLEMENT LATER
	router.use('/api', passport.authenticate('basic', { session: false }));

	router.get('/api/data', ensureAuthenticated, function(req, res) {
		console.log(req.isAuthenticated());
	    res.json([
	        { value: 'foo' },
	        { value: 'ave' },
	        { value: 'abx' },
	    ]);
	});

	router.get('/:name', checkForUser, function(req, res, next) {
		res.render('profile', {
			currentUser: req.user,
			isFollowing: req.isFollowing,
			user: req.userToLoad,
			isAuthenticated: req.isAuthenticated(),
		});
	});

	//Middleware functions
	function checkForUser(req, res, next) {
		User.findOne({ username: req.params.name }, function(err, user) {
			if (err) {
				req.userToLoad = undefined;
				res.send(404);
			} else if (!user) {
				req.userToLoad = undefined;
				res.send(404);
			} else {
				req.userToLoad = user;
				if (req.user)
					isFollowing(req, res, user, next);
				else
					next();
			}
			});
	}

	function isFollowing(req, res, user, next) {
		req.user.populate({
			path: 'following',
			match: { username: user.username },
			options: { limit: 1 }
		}, function(err, currentuser) {
			console.log(currentuser.username);
			console.log(currentuser.following);
			if (err)
				throw err
			else if (currentuser.following.length > 0) {
				console.log('hello');
				req.isFollowing = true;
			} else {
				console.log('no');
				req.isFollowing = true;
			}

			next();
		});
	}

	function followUser(req, res, next) {
		followUserWithUserName(req, res, req.body.val);
		req.isFollowing = true;
		next();
	}

	function followUserWithUserName(req, res, username) {
		User.findOne({ username: username }, function(err, user) {
			if(err)
				throw err
			else {
				req.user.following.push(user);
				req.user.save(function(err) {
					if (err) throw err
				});
			}
		})
	}

	function ensureAuthenticated(req, res, next) {
	    if (req.isAuthenticated()) {
	    	next();
	    } else {
	    	res.redirect('/signin');
	    }
	}

	function checkForSignUpRedirect(req, res, next) {
		if (req.isAuthenticated()) {
			res.redirect('/');
		} else {
			next();
		}
	}
};
