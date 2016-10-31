'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
var morgan     = require("morgan");
var bodyParser = require("body-parser");
var jwt        = require("jsonwebtoken");
var mongoose   = require("mongoose");
// var User     = require('./api/controllers/user');
// var config = require('./api/controllers/config'); // get our config file

module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

process.on('uncaughtException', function(err) {
    console.log(err);
});

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 10011;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});

app.get('/api', function(req, res) {
    res.sendFile(__dirname + "/api/controllers/resources/APIDoc/" + "index.html");
});






// mongoose.connect(config.url); // connect to database
// mongoose.Promise = global.Promise;
// app.set('superSecret', config.secret); // secret variable

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(morgan("dev"));

// app.use(function(req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE');
//    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
//     next();
// });

// app.post('/authenticate', function(req, res) {
//     User.findOne({email: req.body.username, password: req.body.password}, function(err, user) {
//         if (err) {
//             res.json({
//                 type: false,
//                 data: "Error occured: " + err
//             });
//         } else {
//             if (user) {
//                res.json({
//                     type: true,
//                     data: user,
//                     token: user.token
//                 }); 
//             } else {
//                 res.json({
//                     type: false,
//                     data: "Incorrect email/password"
//                 });    
//             }
//         }
//     });
// });

// app.post('/signin', function(req, res) {
//     console.log("called");
//     console.log(req.body);

    

//     User.findOne({username: req.body.username, password: req.body.password}, function(err, user) {
//         console.log(err);
//         console.log(user);
//         if (err) {
//             res.json({
//                 type: false,
//                 data: "Error occured: " + err
//             });
//         } else {
//             if (user) {
//                 res.json({
//                     type: false,
//                     data: "User already exists!"
//                 });
//             } else {
//                 var userModel = new User();
//                 userModel.username = req.body.username;
//                 userModel.password = req.body.password;
//                 userModel.save(function(err, user) {
//                     user.token = jwt.sign(user, process.env.JWT_SECRET);
//                     user.save(function(err, user1) {
//                         res.json({
//                             type: true,
//                             data: user1,
//                             token: user1.token
//                         });
//                     });
//                 })
//             }
//         }
//     });


// });

// app.get('/setup', function(req, res) {

//   // create a sample user
//   var nick = new User({ 
//     name: 'Kad', 
//     password: '12345678',
//     admin: true 
//   });

//   // save the sample user
//   nick.save(function(err) {
//     if (err) throw err;

//     console.log('User saved successfully');
//     res.json({ success: true });
//   });
// });

// function ensureAuthorized(req, res, next) {
//     var bearerToken;
//     var bearerHeader = req.headers["authorization"];
//     if (typeof bearerHeader !== 'undefined') {
//         var bearer = bearerHeader.split(" ");
//         bearerToken = bearer[1];
//         req.token = bearerToken;
//         next();
//     } else {
//         res.send(403);
//     }
// }

// app.get('/me', ensureAuthorized, function(req, res) {
//     User.findOne({token: req.token}, function(err, user) {
//         if (err) {
//             res.json({
//                 type: false,
//                 data: "Error occured: " + err
//             });
//         } else {
//             res.json({
//                 type: true,
//                 data: user
//             });
//         }
//     });
// });








