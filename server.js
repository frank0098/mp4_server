// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var Llama = require('./models/llama');
var Task = require('./models/task');
var UserSchema = require('./models/user');
var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://username:password@ds055495.mlab.com:55495/webmp4');

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 3000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// All our routes will start with /api
app.use('/api', router);

//Default route here
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});

//Llama route
var llamaRoute = router.route('/llamas');

// var llama = new Llama();
 
// llama.name = req.body.name;
// llama.height = req.body.height;
 
// llama.save(function(err) {
//      If (err)
//          res.send(err);
 
//      res.json({ message: ‘llama added to database’, data:llama });
//     });
// });



llamaRoute.get(function(req, res) {
  res.json([{ "name": "alice", "height": 12 }, { "name": "jane", "height": 13 }]);
});

//Add more routes here

var userRoute = router.route('/users');

userRoute.get(function(req,res){
	// res.json(req.query.id+' '+req.query.limit+' '+req.query.count);
	UserSchema.find(function(err,users){
		if(err)
			res.send(err);
		res.json(users);
	})

});


// Todo.find(function(err, todos) {

//             // if there is an error retrieving, send the error. nothing after res.send(err) will execute
//             if (err)
//                 res.send(err)

//             res.json(todos); // return all todos in JSON format
//         });

// userRoute.post(function(req,res){
// 	UserSchema.create({
// 		name:req.body.name
// 	},function(err,user){
// 			if(err)
// 				res.send(err);
// 			User.find(function(err,users){
// 				if(err)
// 					res.send(err);
// 				res.json(users);
// 			})
// 		})
// });
userRoute.post(function(req, res, next) {
  UserSchema.create({name:req.body.name}, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

// Start the server
app.listen(port);
console.log('Server running on port ' + port);

// app.get('/api/llamas',function(err,res){
// 	res.json([{ "name": "alice", "height": 12 }, { "name": "jane", "height": 13 }]);
// })


