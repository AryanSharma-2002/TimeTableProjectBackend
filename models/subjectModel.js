const mongoose = require("mongoose");
// name
// email
// password
// profilePic
const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },
});

const subjectModel = new mongoose.model("Subject", subjectSchema);

module.exports = { Subject: subjectModel };
