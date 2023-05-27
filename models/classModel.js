const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
  },
});

const classModel = new mongoose.model("Class", classSchema);

module.exports = { Class: classModel };
