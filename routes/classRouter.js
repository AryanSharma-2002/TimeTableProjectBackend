const express = require("express");
const router = express.Router();

const {
  addClass,
  getAllClasses,
  removeClass,
} = require("../controllers/classController");

// isme body mai subName jayega jisko add krna

router.post("/", addClass); // to add a new class
router.get("/", getAllClasses); // get all classes
router.delete("/remove", removeClass); // remove a class from school

module.exports = router;
