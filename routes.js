module.exports = function(app, router, passport) {
	router.get('/', ensureAuthenticated, function(req, res, next) {
	  res.render('index', { title: 'fuckfacebook',
	  	isAuthenticated: req.isAuthenticated(),
	  	user: req.user
	  });
	});

	router.get('/signin', function(req, res, next) {
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

	function ensureAuthenticated(req, res, next) {
	    if (req.isAuthenticated()) {
	        next();
	    } else {
	    	res.redirect('/signin');
	    }
	}
};
