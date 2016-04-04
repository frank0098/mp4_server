// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var TaskSchema   = new mongoose.Schema({
  name: String,
  description: String,
  deadline: Date,
  completed: Boolean,
  assignedUser: String,
  assignedUserName: String,
  dateCreated: { type: Date, default: Date.now },
});

// Export the Mongoose model
module.exports = mongoose.model('Task', TaskSchema);