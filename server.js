const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");
const cors = require("cors");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const subjectRouter = require("./routes/subjectRouter");
const timeSlotRouter = require("./routes/timeSlotRouter");
const onlyTeacherRouter = require("./routes/onlyTeacherRouter");
const teacherRouter = require("./routes/teacherRouter");
const classRouter = require("./routes/classRouter");
const classTimeTableRouter = require("./routes/classTimeTableRouter");
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/subject", subjectRouter);

app.use("/api/timeSlot", timeSlotRouter);

app.use("/api/teacher/", onlyTeacherRouter);
app.use("/api/confTeacher/", teacherRouter);

app.use("/api/class/", classRouter);

app.use("/api/classTimeTable/", classTimeTableRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT_NO, () => {
  console.log(`listening at port no. ${process.env.PORT_NO}`);
});
