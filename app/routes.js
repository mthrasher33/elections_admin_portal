// app/routes.js
var datalayer = require('../data/datalayer.js');
var multer  = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/reports')
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname);        
  }
})

var upload = multer({storage:storage});
var fs = require('fs');

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
		var menu = req.query.menu ? req.query.menu : '';
		var option = req.query.option ? req.query.option : '';
		var detail = req.query.detail ? req.query.detail : 0;

		// console.log('menu:');
		// console.log(menu);

		// console.log('option:');
		// console.log(option);
		// console.log('detail:');
		// console.log(detail);

		var isLoggedIn = false;
		if (req.isAuthenticated()){isLoggedIn = true};
			
			if(menu === 'candidates'){
				if(detail > 0){
					datalayer.candidatesViewDetail(detail, function(err, rows, fields){
				        if(!err){
						    res.render('dashboard.ejs',{
								user: req.user,
								isLoggedIn: isLoggedIn, 
								data: rows,
								menu: menu,
								option: option,
								detail: detail
							});
							console.log(data);
		        		} else {
		            		console.log('Error while performing Query: ' + err);
		        		}
		    		})
		    	} else {
		    		datalayer.candidatesView( function(err, rows, fields){
						if(!err){
						var query=req.query.detail;
						res.render('dashboard.ejs',{
								user: req.user,
								isLoggedIn: isLoggedIn,
								data: rows,
								menu: menu,
								option: option,
								detail: detail
							});
						} else {
							console.log('Error while performing Query ' + err);
						}
					});
		    	}
			} else if (menu==='committees'){
				if(detail > 0){
					datalayer.committeesViewDetail(function(err, rows, fields){
				        if(!err){
						    res.render('dashboard.ejs',{
								user: req.user,
								isLoggedIn: isLoggedIn, 
								data: rows,
								menu: menu,
								option: option,
								detail: detail
							});
		        		} else {
		            		console.log('Error while performing Query: ' + err);
		        		}
		    		})
		    	} else {
		    		datalayer.committeesView(function(err, rows, fields){
						if(!err){
						var query=req.query.detail;
						res.render('dashboard.ejs',{
								user: req.user,
								isLoggedIn: isLoggedIn,
								data: rows,
								menu: menu,
								option: option,
								detail: detail
							});
						} else {
							console.log('Error while performing Query ' + err);
						}
					});
		    	}




			}





			else{ //default to candidate list view
					datalayer.candidatesView(function(err, rows, fields){
				        if(!err){
						    res.render('dashboard.ejs',{
								user: req.user,
								isLoggedIn: isLoggedIn, 
								data: rows,
								menu: menu,
								option: option,
								detail: detail
							});
		        		} else {
		            		console.log('Error while performing Query: ' + err);
		        		}
		    		})
			}
	})


	//PARTIAL SUBMENUS FOR ADMIN DASHBOARD
	app.get('/committees', isLoggedIn, function(req, res){
		var data;
		var query=req.query;
		//console.log('get committees!');
		datalayer.candidatesView(function(err, rows, fields){
			if(!err){
				res.render('partials/dashboard/committees', {layout:false, data:rows, option: req.query.option, detail: req.query.detail});
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
		datalayer.candidatesView(function(err, rows, fields){
			if(!err){
				res.render('partials/dashboard/committeesView', {layout:false, data:rows, option: req.query.option, detail: req.query.detail});
			} else {
				console.log(err);
			}
		});
	})
	app.get('/committeesViewDetail', isLoggedIn, function(req, res){
		datalayer.committeesViewDetail(req.query.detail, function(err, rows, fields){
			if(!err){
				var query=req.query.detail; 
				res.render('partials/dashboard/committeesViewDetail', {layout:false, data:rows, option:req.query.detail});
				console.log(rows.length);
			} else {
				console.log('Error while performing Query ' + err);
			}
		});
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
		datalayer.candidatesView(function(err, rows, fields){
			if(!err){
				res.render('partials/dashboard/candidatesEdit', {layout:false, data:rows, option:req.query.option, detail: req.query.detail});
			} else {
				console.log(err);
			}
		});		
	})


	app.get('/candidateseditdetail', isLoggedIn, function(req,res){
		var data;
		var query=req.query.option;
		datalayer.candidatesViewDetail(req.query.detail, function(err, rows, fields){
			if(!err){
			var query=req.query.detail;
			res.render('partials/dashboard/candidatesEditDetail', {layout:false, data:rows, option:req.query.detail});
			console.log(rows);
			} else {
				console.log('Error while performing Query ' + err);
			}
		});	
	})

	app.post('/candidateseditdetails', isLoggedIn, function(req,res){
		var phone = req.body.phone ? req.body.phone : '';
		var fax = req.body.fax ? req.body.fax : '';
		var email = req.body.email ? req.body.email : '';
		var website = req.body.website ? req.body.website : '';
		var youtube = req.body.youtube ? req.body.youtube : '';
		var facebook = req.body.facebook ? req.body.facebook : '';
		var twitter = req.body.twitter_handle ? req.body.twitter_handle : '';
		var linkedin = req.body.linkedin ? req.body.linkedin : '';
		var candidateid = req.body.candidateid ? req.body.candidateid : '';
		 datalayer.updateCandidate(phone, fax, email, website, youtube, facebook, twitter, linkedin, candidateid, function(err, rows, fields){
		 	if(!err){
				res.redirect('/dashboard?menu=candidates&option=edit');
		 	} else {
		 		console.log('Error while performing Query ' + err);
		 	}
		 });	
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
	    })
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
		datalayer.candidatesView(function(err, rows, fields){
			if(!err){
				res.render('partials/dashboard/reports', {layout:false, data:rows, option: req.query.option, detail: req.query.detail});
			} else {
				console.log(err);
			}
		});
	})

	app.get('/reportscreate', isLoggedIn, function(req, res){
		var data;
		var query=req.query;
		console.log(query);		
		datalayer.candidatesView(function(err, rows, fields){
			if(!err){
		res.render('partials/dashboard/reportscreate', {layout:false, data:rows, option:req.query.option, detail: req.query.detail});
			} else {
				console.log(err);
			}
		});
	})

	app.get('/reportsview', isLoggedIn, function(req, res){
		var data;
		var query=req.query;
		console.log(query);		
		//so it finds the view when you do this
		datalayer.candidatesView(function(err, rows, fields){
			if(!err){
				res.render('partials/dashboard/reportsview', {layout:false, data:rows, option:req.query.option, detail: req.query.detail});
			} else {
				console.log(err);
			}
		});

	})

	app.get('/reportsviewdetail', isLoggedIn, function(req, res){
		var data;
		var query=req.query;
		datalayer.reportsViewDetail(req.query.detail, function(err, rows, fields){
			if(!err){
				var query=req.query.detail;
				res.render('partials/dashboard/reportsViewDetail', {layout:false, data:rows, option:req.query.option, detail: req.query.detail});
				console.log(rows);
			} else {
				console.log('Error while performing Query ' + err);
			}
		});
	})

	app.get('/reportsedit', isLoggedIn, function(req, res){
		var data;
		var query=req.query;
		console.log(query);		
		//so it finds the view when you do this
		datalayer.candidatesView(function(err, rows, fields){
			if(!err){
				res.render('partials/dashboard/reportsedit', {layout:false, data:rows, option: req.query.option, detail: req.query.detail});
			} else {
				console.log(err);
			}
		});	})

	app.get('/reportseditdetail', isLoggedIn, function(req, res){
		var data;
		var query=req.query;
		console.log(query);		
		//so it finds the view when you do this
		datalayer.reportsViewDetail(req.query.detail, function(err, rows, fields){
			if(!err){
				var query=req.query.detail;
				res.render('partials/dashboard/reportsEditDetail', {layout:false, data:rows, option:req.query.detail});
				console.log(rows);
			} else {
				console.log('Error while performing Query ' + err);
			}
		});
	})

	app.post('/reportseditdetails', upload.single('machinereadablefile'), function(req,res){
		//console.log(req.body);
		console.log(req.file)
		//console.log(req.body.machinereadablefile);
		var beginningcashbalance = req.body.beginningcashbalance ? req.body.beginningcashbalance : '';
		var additions = req.body.additions ? req.body.additions : '';
		var totalitemizedcontributions = req.body.totalitemizedcontributions ? req.body.totalitemizedcontributions : '';
		var totalnonitemizedcontributions = req.body.totalnonitemizedcontributions ? req.body.totalnonitemizedcontributions : '';
		var subtractions = req.body.subtractions ? req.body.subtractions : '';
		var endingcashbalance = req.body.endingcashbalance ? req.body.endingcashbalance : '';
		var campaignfinancereportcountylink = req.body.campaignfinancereportcountylink ? req.body.campaignfinancereportcountylink : '';
		var machinereadablefile = req.file.filename ? req.file.filename : '';
		var idreport = req.body.idreport ? req.body.idreport : '';
		 datalayer.updateReport(beginningcashbalance, additions, totalitemizedcontributions, totalnonitemizedcontributions, subtractions, endingcashbalance, campaignfinancereportcountylink, machinereadablefile, idreport, function(err, rows, fields){
		 	if(!err){
				res.redirect('/dashboard?menu=reports&option=edit');
		 	} else {
		 		console.log('Error while performing Query ' + err);
		 	}
		 });	
	})

	app.get('/donations', isLoggedIn, function(req, res){
		var data;
		var query=req.query;
		console.log(query);		
		//so it finds the view when you do this
		res.render('partials/dashboard/donations', {layout:false, data:data});
	})


	app.get('/public/reports/:reportName', function(req, res){
  		var filename = req.params.reportName;
  		//console.log(__dirname)
  		//res.attachment(filename);
  		//res.sendFile( __dirname, 'reports/' + filename);

	});

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
