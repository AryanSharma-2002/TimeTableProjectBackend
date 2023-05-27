const mongoose = require("mongoose");
const autoIncrementModelID = require("./counterModel");

const onlyTeacherSchema = new mongoose.Schema({
  tid: { type: Number, min: 1 },
  name: {
    type: String,
    lowercase: true,
  },
});
onlyTeacherSchema.pre("save", function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  autoIncrementModelID("activities", this, next);
});

const onlyTeacherModel = new mongoose.model("OnlyTeacher", onlyTeacherSchema);

module.exports = { OnlyTeacher: onlyTeacherModel };
