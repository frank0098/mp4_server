// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var Llama = require('./models/llama');
var Task = require('./models/task');
var UserSchema = require('./models/user');
var TaskSchema = require('./models/task');
var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://username:password@ds055495.mlab.com:55495/webmp4');

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

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


//Add more routes here

var userRoute = router.route('/users');
var userdetailRoute = router.route('/users/:userid');
var taskRoute = router.route('/tasks');
var taskdetailRoute = router.route('/tasks/:taskid');

userRoute.get(function(req,res){
	// res.send(req.query.where+' '+req.query.limit+' '+req.query.count);
  var where={};
  var sort={};
  var select={};
  var skip=0;
  var limit=100000;
  var count=false;
  if(req.query.where!=undefined)
    where=JSON.parse(req.query.where);
  if(req.query.sort!=undefined)
    sort=JSON.parse(req.query.sort);
  if(req.query.select!=undefined)
    select=JSON.parse(req.query.select);
  if(req.query.skip!=undefined)
    skip=req.query.skip;
  if(req.query.limit!=undefined)
    limit=req.query.limit;
  if(req.query.count!=undefined)
    count=req.query.count;

	UserSchema.find(where,select,function(err,users){
		if(err)
      {
        res.status(500);
        res.json({"message":err,"data":[]});
      }
		if(count==false)
      {
        res.json({"message":"OK","data":users});
      }
    else
      {
        var i=0;
        for(x in users){
          i++;
        }
        res.json({"message":"OK","data":i});
      }
	}).limit(limit).skip(skip).sort(sort);

});


userRoute.post(function(req, res, next) {
  var user_data = {name:req.body.name,email:req.body.email,pendingTasks:[]};
  var new_user=new UserSchema(user_data);

  UserSchema.count({email:req.body.email},function(err,count){
    if(!count){
      new_user.save(function (err, post) {
      if (err) {
        var errors=err.errors;
        var errarray=[];
        for(x in errors){
          errarray.push(errors[x].message);
        }
        res.status(500);
        res.json({
      "message": errarray.join(),
      "data": []})
      }
      else{
        res.status(201);
        res.json({
      "message": "User Created",
      "data": post})
      }
    });
    }
    else{
      res.status(500);
      res.json({
      "message": "Email already Exists",
      "data": []})
    }
  })

  
});

userRoute.options(function(req, res){
      res.writeHead(200);
      res.end();
});

userdetailRoute.delete(function(req,res){
  var userid=req.params.userid;
  if(userid.match(/^[0-9a-fA-F]{24}$/)){
    UserSchema.find({"_id":userid},function(err,user){
      if(err){
        res.status(404);
            res.json({"message":"User Not Found","data":[]});
      }
      else{
        if(user.length!=0){
          UserSchema.remove({"_id":userid},function(err,user){
          if(err){
            res.status(500);
            res.json({"message":"Internal Error","data":[]});
          }
          else{
            res.status(200);
            res.json({
            "message": "User Deleted",
            "data": []})

          }
        })

        }
        else{
          res.status(404);
          res.json({"message":"User Not Found","data":[]});
        }
        

      }
    })

    

  }
  else{
    res.status(404);
    res.json({"message":"User Not Found","data":[]});
  }

})


userdetailRoute.put(function(req, res, next){
  var userid=req.params.userid;
  if(userid.match(/^[0-9a-fA-F]{24}$/)){
    var user_data = {name:req.body.name,email:req.body.email,pendingTasks:req.body.pendingTasks};
    if(req.body.name!=null && req.body.email!=null){
      UserSchema.count({email:req.body.email},function(err,count){
        UserSchema.find({"_id":userid},function(err,user){
          if(err){
            res.status(404);
            res.json({"message":"User Not Found","data":[]});
          }
          else{
            var email=user[0].email;
            if(!count || email==req.body.email){

              UserSchema.update({"_id":userid},{$set:user_data},function(err,user){
                if(err)
                  res.json({"message":err,"data":[]});
                if(user.length!=0)
                  {
                    UserSchema.find({"_id":userid},function(err,retdata){
                      if(err){
                        res.status(404);
                        res.json({"message":"User Not Found","data":[]});
                      }
                      else{

                          res.json({"message":"OK","data":retdata});
                      }
                    })
                  }
                else{
                  res.status(404);
                  res.json({"message":"User Not Found","data":[]});
                }
              })

            }
            else{
              res.status(500);
              res.json({
              "message": "Email already Exists",
              "data": []})
            }
          }
        })
        
      })
    }
    else{
      res.status(500)
      res.json({"message":"username/email should not be empty","data":[]});
    }
  }
  else{
    res.status(404);
    res.json({"message":"User Not Found","data":[]});
  }
})

userdetailRoute.get(function(req,res){
  var userid=req.params.userid;
  if(userid.match(/^[0-9a-fA-F]{24}$/)){
        UserSchema.find({_id:userid},function(err,user){
          if(err)
            res.json({"message":err,"data":[]});
          if(user.length!=0)
            res.json({"message":"OK","data":user[0]});
          else{
            res.status(404);
            res.json({"message":"User Not Found","data":[]});
          }

        })
    }
    else{
      res.status(404);
      res.json({"message":"User Not Found","data":[]});
    }
})




taskRoute.get(function(req,res){
  // res.send(req.query.where+' '+req.query.limit+' '+req.query.count);
  var where={};
  var sort={};
  var select={};
  var skip=0;
  var limit=100;
  var count=false;
  if(req.query.where!=undefined)
    where=JSON.parse(req.query.where);
  if(req.query.sort!=undefined)
    sort=JSON.parse(req.query.sort);
  if(req.query.select!=undefined)
    select=JSON.parse(req.query.select);
  if(req.query.skip!=undefined)
    skip=req.query.skip;
  if(req.query.limit!=undefined)
    limit=req.query.limit;
  if(req.query.count!=undefined)
    count=req.query.count;
  TaskSchema.find(where,select,function(err,users){
    if(err)
      {
        res.status(500);
        res.json({"message":err,"data":[]});
      }
    if(count==false)
      {
        res.json({"message":"OK","data":users});
      }
    else
      {
        var i=0;
        for(x in users){
          i++;
        }
        res.json({"message":"OK","data":i});
      }
  }).limit(limit).skip(skip).sort(sort);

});

taskRoute.options(function(req, res){
      res.writeHead(200);
      res.end();
});


taskRoute.post(function(req, res, next) {
  var assigneduser = "";
  if(req.body.assignedUserName=="" || req.body.assignedUserName==null)
    assigneduser="unassigned"
  else
    assigneduser=req.body.assignedUserName;

  var task_data = {name:req.body.name,
    description:req.body.description,
    deadline:req.body.deadline,
    completed:req.body.completed,
    assignedUser:req.body.assignedUser,
    assignedUserName:req.body.assignedUserName};

  var new_task=new TaskSchema(task_data);

  new_task.save(function (err, post) {
      if (err) {
        var errors=err.errors;
        var errarray=[];
        for(x in errors){
          errarray.push(errors[x].message);
        }
        res.status(500);
        res.json({
      "message": errarray.join(),
      "data": []})
      }
      else{
        res.status(201);
        res.json({
      "message": "Task Created",
      "data": post})
      }
    });


  
});


taskdetailRoute.get(function(req,res){
  var taskid=req.params.taskid;
  if(taskid.match(/^[0-9a-fA-F]{24}$/)){
        TaskSchema.find({_id:taskid},function(err,task){
          if(err)
            res.json({"message":err,"data":[]});
          if(task.length!=0)
            res.json({"message":"OK","data":task});
          else{
            res.status(404);
            res.json({"message":"Task Not Found","data":[]});
          }

        })
    }
    else{
      res.status(404);
      res.json({"message":"Task Not Found","data":[]});
    }
})


taskdetailRoute.put(function(req, res, next){
  var taskid=req.params.taskid;
  if(taskid.match(/^[0-9a-fA-F]{24}$/)){
      var assigneduser = "";
      var assignedusername = "";
      var description="";
      if(req.body.assignedUser=="" || req.body.assignedUser==null)
        assigneduser=""
      else
        assigneduser=req.body.assignedUser;

      if(req.body.assignedUserName=="" || req.body.assignedUserName==null)
        assignedusername="unassigned"
      else
        assignedusername=req.body.assignedUserName;

      if(req.body.description=="" || req.body.description==null)
        description=""
      else
        description=req.body.description;

     var task_data = {name:req.body.name,
      description:description,
        deadline:req.body.deadline,
        completed:req.body.completed,
        assignedUser:assigneduser,
        assignedUserName:assignedusername};
      var new_task=new TaskSchema(task_data);

    if(req.body.name!=null && req.body.deadline!=null){
        TaskSchema.update({"_id":taskid},{$set:task_data},function(err,task){
        if(err)
          res.json({"message":err,"data":[]});
        if(task.length!=0){
            TaskSchema.find({_id:taskid},function(err,task){
              if(err){
                res.json({"message":err,"data":[]});
              }
              else{
                res.json({"message":"OK","data":task});
              }
            })

          }
        else{
          res.status(404);
          res.json({"message":"Task Not Found","data":[]});
        }
      })

    }
    else{
      res.status(500)
      res.json({"message":"taskname/deadline should not be empty","data":[]});
    }
  }
  else{
    res.status(404);
    res.json({"message":"Task Not Found","data":[]});
  }
})

taskdetailRoute.delete(function(req,res){
  var taskid=req.params.taskid;
  if(taskid.match(/^[0-9a-fA-F]{24}$/)){
    TaskSchema.find({"_id":taskid},function(err,task){
      if(err){
        res.status(404);
        res.json({"message":"Task Not Found","data":[]});
      }
      else{
        if(task.length!=0){
          TaskSchema.remove({"_id":taskid},function(err,task){
          if(err){
            res.status(500);
            res.json({"message":"Internal Error","data":[]});
          }
          else{
            res.status(200);
            res.json({
            "message": "Task Deleted",
            "data": []})

          }
        })

        }
        else{
          res.status(404);
          res.json({"message":"Task Not Found","data":[]});
        }
        

      }
    })
    

  }
  else{
    res.status(404);
    res.json({"message":"Task Not Found","data":[]});
  }

})



app.get('/', function (req, res) {
  res.send('Hello World!');
});

// Start the server
app.listen(port);
console.log('Server running on port ' + port);


// var llama = new Llama();
 
// llama.name = req.body.name;
// llama.height = req.body.height;
 
// llama.save(function(err) {
//      If (err)
//          res.send(err);
 
//      res.json({ message: ‘llama added to database’, data:llama });
//     });
// });



// llamaRoute.get(function(req, res) {
//   res.json([{ "name": "alice", "height": 12 }, { "name": "jane", "height": 13 }]);
// });


// app.get('/api/llamas',function(err,res){
// 	res.json([{ "name": "alice", "height": 12 }, { "name": "jane", "height": 13 }]);
// })

// Todo.find(function(err, todos) {

//             // if there is an error retrieving, send the error. nothing after res.send(err) will execute
//             if (err)
//                 res.send(err)

//             res.json(todos); // return all todos in JSON format
//         });

// userRoute.post(function(req,res){
//  UserSchema.create({
//    name:req.body.name
//  },function(err,user){
//      if(err)
//        res.send(err);
//      User.find(function(err,users){
//        if(err)
//          res.send(err);
//        res.json(users);
//      })
//    })
// });

