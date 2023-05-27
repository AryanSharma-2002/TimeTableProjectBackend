const expressAsyncHandler = require("express-async-handler");
const { Subject } = require("../models/subjectModel");

const addSubject = expressAsyncHandler(async (req, res) => {
  const { subName } = req.body;
  if (!subName) {
    res.send("please fill all fields");
    return;
  }
  const [alreadyAdded] = await Subject.find({ name: subName });
  if (alreadyAdded) {
    res.send("already exists in database");
    return;
  }
  try {
    const result = await Subject.create({
      name: subName,
    });
    if (result) {
      res.status(200).send(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

const getAllSubjects = expressAsyncHandler(async (req, res) => {
  try {
    const result = await Subject.find({});
    if (result) {
      res.status(200).json(result);
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

const removeSubject = expressAsyncHandler(async (req, res) => {
  try {
    const { name } = req.query;
    const result = await Subject.deleteOne({ name });
    if (result) {
      res.status(200).json(result);
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

const searchSubjects = expressAsyncHandler(async (req, res) => {
  try {
    const keyword = req.query.key
      ? {
          name: { $regex: req.query.key, $options: "i" },
          // name: { $eq: "maths" },
        }
      : {};

    const subjects = await Subject.find(keyword);

    res.json(subjects);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
module.exports = { addSubject, getAllSubjects, searchSubjects, removeSubject };
