const mongoose = require("mongoose");

const classTimeTableSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  incharge: { type: mongoose.Schema.Types.ObjectId, ref: "OnlyTeacher" },
  dayInfo: [
    {
      dayName: {
        type: String,
        required: true,
        trim: true,
      },
      entries: [
        {
          timeSlot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TimeSlot",
            required: true,
          },
          teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
          },
          subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
          },
        },
      ],
    },
  ],
});
const classTimeTableModel = new mongoose.model(
  "ClassTimeTable",
  classTimeTableSchema
);

module.exports = { ClassTimeTable: classTimeTableModel };
