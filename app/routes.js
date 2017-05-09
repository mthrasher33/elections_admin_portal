// app/routes.js
var datalayer = require('../data/datalayer.js');

module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		var isLoggedIn = false;
		if (req.isAuthenticated()){isLoggedIn = true};
		res.render('index.ejs', {isLoggedIn: isLoggedIn}); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {
		var isLoggedIn = false;
		if (req.isAuthenticated()){isLoggedIn = true};
		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage'), isLoggedIn: isLoggedIn });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
         
            successRedirect : '/dashboard?menu=candidates&option=view', // redirect to the secure dashboard
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', isLoggedIn, function(req, res) {
		var isLoggedIn = false;
		if (req.isAuthenticated()){isLoggedIn = true};
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage'), isLoggedIn: isLoggedIn });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// ADMIN DASHBOARD 
	app.get('/dashboard', isLoggedIn, function(req,res){
		var query = req.query.menu;
		console.log(query);

		//if (!query){
		//	res.redirect('/dashboard/?menu=candidates&option=view');
		//}
		var isLoggedIn = false;
		if (req.isAuthenticated()){isLoggedIn = true};
		 datalayer.candidatesView(function(err, rows, fields){
	        if(!err){
	        	//if (!query.menu){
			        res.render('dashboard.ejs',{
						user: req.user,
						isLoggedIn: isLoggedIn, //get the user out of the session and pass to template
						data: rows,
						menu: req.query.menu,
						option: req.query.option,
						detail: ''
					});
		   		 //} else {
		   		 //	res.redirect('/dashboard/?' + req.query.menu);
		   		// }

	            //res.send({data: rows});
	        } else {
	            console.log('Error while performing Query: ' + err);
	        }
		 console.log(rows);
	    })
	})


	//PARTIAL SUBMENUS FOR ADMIN DASHBOARD
	app.get('/committees', isLoggedIn, function(req, res){
		var data;
		var query=req.query;
		//console.log('get committees!');
		datalayer.committeesView(function(err, rows, fields){
			if(!err){
			res.render('partials/dashboard/committees', {layout:false, committees:rows, option: req.query.option});
			} else {
				console.log(err);
			}
		});
	})

	app.get('/committeescreate', isLoggedIn, function(req, res){
		var data;
		var query=req.query;
		console.log(query);
		res.render('partials/dashboard/committeesCreate', {layout:false, data:data});
	})
	app.get('/committeesEdit', isLoggedIn, function(req, res){
		var data;
		var query=req.query;
		res.render('partials/dashboard/committeesEdit', {layout:false, data:data});
	})
	app.get('/committeesView', isLoggedIn, function(req, res){
		var data;
		var query=req.query.detail;
		console.log(query);
		res.render('partials/dashboard/committeesView', {layout:false, data:data});
	})	

	app.get('/candidates', isLoggedIn, function(req, res){
		var data;
		var query=req.query;
		console.log(query);
		//console.log(query);
		//so it finds the view when you do this
		datalayer.candidatesView(function(err, rows, fields){
			if(!err){
				res.render('partials/dashboard/candidates', {layout:false, data:rows, option: req.query.option, detail: req.query.detail});
			} else {
				console.log(err);
			}
		});

	})

	app.get('/candidatesedit', isLoggedIn, function(req,res){
		var data;
		var query=req.query.option;
		res.render('partials/dashboard/candidatesEdit', {layout:false, data:data, option:req.query.option});
	})

	app.get('/candidatesview', isLoggedIn, function(req,res){
		var data;
		var query=req.query.option;
		datalayer.candidatesView(function(err, rows, fields){
	        if(!err){
				res.render('partials/dashboard/candidatesView', {layout:false, data:rows, option:req.query.option, detail: req.query.detail});
	        } else {
	            console.log('Error while performing Query: ' + err);
	        }
		 console.log(rows);
	    })
		//res.render('partials/dashboard/candidatesView', {layout:false, data:data, option:req.query.option});
	})

	app.get('/candidatesViewDetail', isLoggedIn, function(req, res){
		datalayer.candidatesViewDetail(req.query.detail, function(err, rows, fields){
			if(!err){
			var query=req.query.detail;
			res.render('partials/dashboard/candidatesViewDetail', {layout:false, data:rows, option:req.query.detail});
			console.log(rows);
			} else {
				console.log('Error while performing Query ' + err);
			}
		});
	})

	app.get('/candidatescreate', isLoggedIn, function(req,res){
		var data;
		var query=req.query.option;
		res.render('partials/dashboard/candidatesCreate', {layout:false, data:data, option:req.query.option});
	})

	app.get('/reports', isLoggedIn, function(req, res){
		var data;
		var query=req.query;
		console.log(query);		
		//so it finds the view when you do this
		res.render('partials/dashboard/reports', {layout:false, data:data});
	})

	app.get('/donations', isLoggedIn, function(req, res){
		var data;
		var query=req.query;
		console.log(query);		
		//so it finds the view when you do this
		res.render('partials/dashboard/donations', {layout:false, data:data});
	})

	//app.get('/dashboard/candidates', isLoggedIn, function(req,res){
//		res.render('partials/candidates');
	//});
};


// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();
		//res.send({ isLoggedIn: true});


	// if they aren't redirect them to the home page
	res.redirect('/login');
		//res.send({ isLoggedIn: false});

}
