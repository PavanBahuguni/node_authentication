var mongoose=require('mongoose');
var session = require('express-session');
var connectMongo = require('connect-mongo')(session);
var app=require('../app');
//Importing custom environment(development || production) configuration module
var config=require('../config/config.js');
//Connecting to mongoDB
var nodemailer = require("nodemailer");
var Cryptr = require('cryptr'),
    cryptr = new Cryptr('myTotalySecretKey');
 
/*  Crypt module sample code for encryption and decryption
var encryptedString = cryptr.encrypt('bacon'),
    decryptedString = cryptr.decrypt(encryptedString);
*/
mongoose.connect(config.dbURL);
var env = process.env.NODE_ENV || 'development';
if(env === 'development'){
	//dev specific settings
	app.use(session(
		{
			secret:config.sessionSecret,
			saveUninitialized:true,
			resave:true
		}));
}else{
	// production specific  settings
	app.use(session({
		secret:config.sessionSecret,
		store:new connectMongo({
			mongooseConnection:mongoose.connections[0],
			stringify:true
		})
	}))
}

//Configuring Nodemailer smtp settings
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "",
        pass: ""
    }
});

//User Schema
var UserSchema=mongoose.Schema({
	username:{
		type:String,
		index:true
	},
	password:{
		type:String,required:true, bcrypt:true
	},
	email:{
		type:String,
	},
	name:{
		type:String
	},
	profileimage:{
		type:String
	},
	varifyCode:{
		type:String
	},
	isVerified:{
		type:Boolean
	}
	
});

var User=module.exports=mongoose.model('User', UserSchema);

module.exports.comparePassword=function(password, userPassword,callback){
	
	try{
			var orgPassword=cryptr.decrypt(userPassword.toString());
	   }catch(ex){
		   console.log(ex);
		   return;
	   }
	if(orgPassword===password){
		callback(null,true);
	}else{
		callback(null,false);
	}
	
}
module.exports.createUser=function(newUser, callback){
	var verifyId=cryptr.encrypt(newUser.username+Math.random());
	newUser.password=cryptr.encrypt(newUser.password);
	newUser.varifyCode=verifyId;
	newUser.isVerified=false;
	newUser.save(callback);
	sendMail(newUser,verifyId);
}
module.exports.getUserByUsername=function(username,callback){
	var query={username:username};
	User.findOne(query, callback);
}
module.exports.getUserById=function(id,callback){
	var query={username:username};
	User.findById(id, callback);
}

module.exports.verifyEmail = function(username, secret, callback){
	var query={username:username};
	
	User.findOne(query, function(err, user){
		if(err)
			console.log("Error occured", err);
		else{
			console.log(user.varifyCode, secret);
			if(user.varifyCode === secret){
				user.isVerified=true;
				user.save(callback(err,true));
				
			}else{
				callback(false);
			}
			
		}
	});
	
}


function sendMail(newUser,verifyId){
  var subject='Email verification link for Node_Auth';
  var text='https://node-authenticater.herokuapp.com/users/authenticate/'+newUser.username+'/'+verifyId;
  var mailOptions={
    to : newUser.email,
    subject : subject,
    text : text
  }
  smtpTransport.sendMail(mailOptions, function(error, response){
  	if(error){
		console.log(error);
  	}else{
		console.log("Message sent: " + response.message);
  	}
 });
}