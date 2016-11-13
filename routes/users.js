var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');


/* GET users listing. */

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{
	  'title':'Register'
  });
});


router.get('/login', function(req, res, next) {
  res.render('login',{
	  'title':'Login'
  });
});

router.post('/register',function(req, res ,next){
	//Get the form values.
	var name=req.body.name;
	var email=req.body.email;
	var username=req.body.username;
	var password=req.body.password;
	var password2=req.body.password2;
	
	
	//Form Validation
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email','Email field is required').notEmpty();
	req.checkBody('email','Email is not valis').isEmail();
	req.checkBody('username','Username fienld is required').notEmpty();
	req.checkBody('password','Password is required').notEmpty();
	req.checkBody('password2','Password do not match').equals(password);
	//Check for errors
	var errors=req.validationErrors();
	if(errors){
		res.render('register', {
			errors:errors,
			name:name,
			email:email,
			username:username,
			password:password,
			password2:password2
		});
	}else{
		var newUser = new User({
			name:name,
			email:email,
			username:username,
			password:password,
		});
		//Create User
		User.createUser(newUser, function(error,user){
			if(error) throw err;
			console.log(user);
		});
		
		//Success Message
		req.flash('success', 'You are now registered! and May login!');
		res.location('/');
		res.redirect('/');
	}
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
	 function(username, password, done) {
		User.getUserByUsername(username, function(err,user){
			if(err) throw err;
			if(!user){
				console.log('Unknown user');
				return done(null, false,{message:'Unkown user'});
			}
			User.comparePassword(password,user.password, function(err,isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null,user);
				}else{
					console.log('Invalid Password');
					return done(null,false,{message:'Invalid Password'});
				}
			});
		});
	}
));
router.post('/login',passport.authenticate('local', {
				failureRedirect:'login',
				failureFlash:"Invalid username or password"
			}),
		    function(req, res, next){
				console.log("body parsing", req.body);
				console.log("Authentication Successful");
				req.flash('success', 'You are logged in');
				res.location('/');
				res.redirect('/');
});
router.get('/authenticate/:mail/:verification',function(req,res){
	var username = req.params.mail;
	var secret = req.params.verification;
	console.log("verifying email");
	User.verifyEmail(username,secret, function(err, isVerified){
		console.log("Testing**********",isVerified);
	});
});

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You have logged out');
	res.redirect('login');
})
module.exports = router;