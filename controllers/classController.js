const expressAsyncHandler = require("express-async-handler");
const { Class } = require("../models/classModel");
const addClass = expressAsyncHandler(async (req, res) => {
  const { className } = req.body;
  if (!className) {
    res.send("please fill all fields");
    return;
  }
  const [alreadyAdded] = await Class.find({ className: className });
  if (alreadyAdded) {
    res.send("already exists in database");
    return;
  }
  try {
    const result = await Class.create({
      className: className,
    });
    if (result) {
      res.status(200).send(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});
const getAllClasses = expressAsyncHandler(async (req, res) => {
  try {
    const result = await Class.find({});
    if (result) {
      res.status(200).json(result);
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});
const removeClass = expressAsyncHandler(async (req, res) => {
  try {
    const { className } = req.body;
    console.log(className);
    const result = await Class.deleteOne({ className });
    if (result) {
      res.status(200).json(result);
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

module.exports = { addClass, getAllClasses, removeClass };
