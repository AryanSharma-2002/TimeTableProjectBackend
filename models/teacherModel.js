const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  teacherRefId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OnlyTeacher",
    sparse: true,
  },
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
});

const teacherModel = new mongoose.model("Teacher", teacherSchema);

module.exports = { Teacher: teacherModel };
