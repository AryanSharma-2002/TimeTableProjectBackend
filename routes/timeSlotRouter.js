const express = require("express");
const router = express.Router();

const {
  addTimeSlot,
  getAllTimeSlots,
} = require("../controllers/timeSlotController");
// isme body mai subName jayega jisko add krna

router.post("/", addTimeSlot);
router.get("/", getAllTimeSlots);

module.exports = router;
