
'user strict'


var jwt    = require('jsonwebtoken');
var util = require("util");
var mysql = require("mysql");

var connection = mysql.createConnection({
  host     : '166.62.10.228',
  user     : 'qhct',
  password : 'qhct@123',
  database : 'quanlychuyenbay'
});

connection.connect();

setInterval(function () {
    connection.query('SELECT 1');
}, 5000);

var serectKey = "quanlychuyenbay";

// generate the JWT
function generateToken(req){
  var token = jwt.sign({
    auth:  'magic',
    agent: req.headers['user-agent'],
    exp:   Math.floor(new Date().getTime()/1000) + 7*24*60*60 // Note: in seconds!
  }, serectKey);  // secret is defined in the environment variable JWT_SECRET
  return token;
}

function authenticate(req, res,next) {

  // find the user
  var param = req.swagger.params.authenticate.value;
  var username = param.user.username;
  var password = param.user.password;

  connection.query("SELECT * FROM user WHERE username = ?", [username],function(err,results) {
  		if(err) {
  			res.status(404).send({"message": "Có lỗi xãy ra vui lòng thử lại"});
  			console.log(err);
  		} else {
  			if(results.length == 0) {
  				res.status(404).send({"message": "Username không tồn tại"});
  			} else {
  				var user = results[0];
  				if(user.username == username && user.password == password) {
  					var token = jwt.sign({
				    auth:  'magic',
				    agent: req.headers['user-agent'],
				    exp:   Math.floor(new Date().getTime()/1000) + 7*24*60*60 // Note: in seconds!
				  }, serectKey);
  					verifyToken(token);
			        res.json({
			          success: true,
			          message: 'Login success',
			          token: token
			        });

  				} else {
  					res.status(404).send({"message": "Sai mật khẩu"});
  				}
  			}
  		}
  });

};




function verifyToken(token) {
	// verify a token symmetric - synchronous
	var decoded = jwt.verify(token, serectKey);

	console.log("TOKEN VALUES: " + decoded); // bar
}

module.exports = {
	authenticate,
	jwt,
	serectKey
};

