const express = require("express");
const router = express.Router();

const {
  addTeacher,
  getAllTeachers,
  searchTeachers,
  subjectsOfTeacher,
  removeTeacher,
} = require("../controllers/teacherController");

// isme body mai subName jayega jisko add krna

router.post("/", addTeacher); // add a new teacher
router.get("/", getAllTeachers); // get all configured teachers data
router.post("/subjectsOfTeacher", subjectsOfTeacher); // which subjects teacher teaches
router.post("/remove", removeTeacher); // remove a configuration from model

module.exports = router;
