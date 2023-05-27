const expressAsyncHandler = require("express-async-handler");
const { OnlyTeacher } = require("../models/onlyTeacherModel");

const addOnlyTeacher = expressAsyncHandler(async (req, res) => {
  const { tid, name } = req.body;
  if (!name) {
    res.send("please all the fields");
    return;
  }
  if (tid) {
    const [alreadyAdded] = await OnlyTeacher.find({ tid: tid });
    if (alreadyAdded) {
      const fullOnlyTeacher = await OnlyTeacher.find({ tid });
      res.status(200).json(fullOnlyTeacher);
      return;
    }
  }

  try {
    const result = await OnlyTeacher.create({
      name: name,
    });
    const fullOnlyTeacher = await OnlyTeacher.find();
    res.status(200).json(fullOnlyTeacher);
    return;
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const removeOnlyTeacher = expressAsyncHandler(async (req, res) => {
  const { tid } = req.body;
  // means only tid di hai sara Onlyteacher remove krdo
  try {
    const result = await OnlyTeacher.deleteOne({ tid: tid });
    res.status(200).json(result);
  } catch (error) {
    console.log("Error removing Onlyteacher", error.message);
    res.status(400).send(error.message);
  }
  return;
});

const getAllOnlyTeachers = expressAsyncHandler(async (req, res) => {
  try {
    const result = await OnlyTeacher.find({});
    if (result) {
      res.status(200).json(result);
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

const searchOnlyTeachers = expressAsyncHandler(async (req, res) => {
  try {
    const keyword = req.query.key
      ? {
          name: { $regex: req.query.key, $options: "i" },
        }
      : {};

    const Onlyteachers = await OnlyTeacher.find(keyword);

    res.json(Onlyteachers);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = {
  addOnlyTeacher,
  getAllOnlyTeachers,
  searchOnlyTeachers,
  removeOnlyTeacher,
};
