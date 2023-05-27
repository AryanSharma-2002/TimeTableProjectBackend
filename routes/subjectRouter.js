const express = require("express");
const router = express.Router();

const {
  addSubject,
  getAllSubjects,
  searchSubjects,
  removeSubject,
} = require("../controllers/subjectController");

// isme body mai subName jayega jisko add krna

router.post("/", addSubject); // api to add a new subject
router.get("/", getAllSubjects); // api to get all the subjects from school model
router.get("/search", searchSubjects); // api to search the subjects based on query string
router.delete("/remove", removeSubject); // api to delete the subject

module.exports = router;
