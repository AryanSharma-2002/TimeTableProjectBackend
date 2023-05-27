const express = require("express");
const router = express.Router();

const {
  addOnlyTeacher,
  getAllOnlyTeachers,
  searchOnlyTeachers,
  removeOnlyTeacher,
} = require("../controllers/onlyTeacherController");

// isme body mai subName jayega jisko add krna

router.post("/", addOnlyTeacher); // add a teacher in Teachers model
router.get("/", getAllOnlyTeachers); // get all the teachers from database
router.get("/search", searchOnlyTeachers); // search the teachers based on their name
router.post("/remove", removeOnlyTeacher); // remove a teacher from model

module.exports = router;
