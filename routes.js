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
	router.post('/follow', function(req, res, next) {
		console.log(req.body.val);
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
			isFollowing: req.following,
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
				isFollowing(req, res, user);
				next();
			}
			});
	}

	function isFollowing(req, res, user) {
		req.isFollowing = false;
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
