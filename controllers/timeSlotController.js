const expressAsyncHandler = require("express-async-handler");
const { TimeSlot } = require("../models/timeSlotModel");

const addTimeSlot = expressAsyncHandler(async (req, res) => {
  const { start, finish, isBreak } = req.body;
  if (!start || !finish) {
    res.send("please fill all fields");
    return;
  }
  const [alreadyAdded] = await TimeSlot.find({ start: start, finish: finish });
  if (alreadyAdded) {
    res.send("already exists in database");
    return;
  }
  try {
    const result = await TimeSlot.create({
      start: start,
      finish: finish,
      isBreak: isBreak,
    });
    if (result) {
      res.status(200).send(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

const getAllTimeSlots = expressAsyncHandler(async (req, res) => {
  try {
    const result = await TimeSlot.find({});
    if (result) {
      res.status(200).json(result);
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});
module.exports = { addTimeSlot, getAllTimeSlots };
