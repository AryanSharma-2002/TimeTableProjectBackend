const mongoose = require("mongoose");
// name
// email
// password
// profilePic
const timeSlotSchema = new mongoose.Schema({
  start: {
    type: String,
    required: true,
  },
  finish: {
    type: String,
    required: true,
  },
  isBreak: {
    type: Boolean,
    default: false,
  },
});

const timeSlotModel = new mongoose.model("TimeSlot", timeSlotSchema);

module.exports = { TimeSlot: timeSlotModel };
