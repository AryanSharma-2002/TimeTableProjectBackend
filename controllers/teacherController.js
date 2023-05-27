const expressAsyncHandler = require("express-async-handler");
const { Subject } = require("../models/subjectModel");
const { Teacher } = require("../models/teacherModel");

const addTeacher = expressAsyncHandler(async (req, res) => {
  // ab isme hume frontend mai tid leni hogi uss tid se _id find krke uss document ki _id backend mai send krdo aur ab isme add krdo simply
  const { teacherRefId, newSubjects } = req.body;
  console.log(teacherRefId, newSubjects);
  if (!teacherRefId) {
    res.send("please all the fields");
    return;
  }
  const [alreadyAdded] = await Teacher.find({ teacherRefId: teacherRefId });
  console.log(alreadyAdded);
  if (alreadyAdded) {
    const result = await Teacher.updateOne(
      { teacherRefId: teacherRefId },
      {
        $addToSet: { subjects: { $each: newSubjects } },
      }
    );

    const fullTeacher = await Teacher.find({ teacherRefId })
      .populate("teacherRefId", "-_id")
      .populate("subjects");
    res.status(200).json(fullTeacher);
    return;
  }

  try {
    const result = await Teacher.create({
      teacherRefId: teacherRefId,
      subjects: newSubjects,
    });
    console.log(result);
    const fullTeacher = await Teacher.find({ teacherRefId: teacherRefId })
      .populate("teacherRefId", "-_id")
      .populate("subjects");
    res.status(200).json(fullTeacher);
    return;
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

const removeTeacher = expressAsyncHandler(async (req, res) => {
  const { teacherRefId, deleteSubs } = req.body;
  if (!deleteSubs || deleteSubs.length === 0) {
    // means only tid di hai sara teacher remove krdo
    try {
      const result = await Teacher.deleteOne({ teacherRefId: teacherRefId });
      res.status(200).json(result);
    } catch (error) {
      console.log("Error removing teacher", error.message);
      res.status(400).send(error.message);
    }
    return;
  }
  try {
    let result = await Teacher.findOne({ teacherRefId: teacherRefId });
    if (!result) {
      res.send("teacher id not exists");
      return;
    }
    const updatedTeacher = await Teacher.updateOne(
      { teacherRefId: teacherRefId },
      { $pull: { subjects: { $in: deleteSubs } } },
      { new: true }
    );
    res.status(200).json(updatedTeacher);
    // result.subjects.filter((sub) => {
    //   return deleteSubs.includes(sub) == false;
    // });
    // result = await Teacher.updateOne(
    //   {
    //     tid: tid,
    //   },
    //   { $set: { subjects: result } }
    // );
  } catch (error) {
    console.log("Error removing subject from teacher", error.message);
    res.status(400).json(error.message);
  }
});

const getAllTeachers = expressAsyncHandler(async (req, res) => {
  try {
    const result = await Teacher.find({})
      .populate("teacherRefId")
      .populate("subjects");
    if (result) {
      res.status(200).json(result);
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

const subjectsOfTeacher = expressAsyncHandler(async (req, res) => {
  const { teacherRefId } = req.body;
  try {
    const [fullTeacher] = await Teacher.find({
      teacherRefId: teacherRefId,
    })
      .populate("teacherRefId")
      .populate("subjects");
    const subjects = fullTeacher.subjects;
    res.status(200).json(subjects);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
module.exports = {
  addTeacher,
  getAllTeachers,
  subjectsOfTeacher,
  removeTeacher,
};
