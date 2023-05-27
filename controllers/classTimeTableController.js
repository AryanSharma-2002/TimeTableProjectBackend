const expressAsyncHandler = require("express-async-handler");
const { ClassTimeTable } = require("../models/classTimeTableModel");
const mongoose = require("mongoose");
const { Teacher } = require("../models/teacherModel");

const checkTeacherAvailability = async (classId, dayName, tsId, teacherId) => {
  // check kro ki vo teacher available hi hai ya nhi means ki agar vo teacher uss day aur time slot par khi aur class le rha fir yha available nhi vrna available hoga
  // means hme sari classes check krni hai ki uss day mai same time slot par kon teacher hai
  // classId, dayName, tsId, teacherId
  // const { classId, dayName, tsId, teacherId } = req.body;
  try {
    let result = await ClassTimeTable.find(
      {
        class: { $ne: classId },
        dayInfo: {
          $elemMatch: {
            dayName: dayName,
            entries: { $elemMatch: { timeSlot: tsId } },
            // "entries.timeSlot": tsId, // upar wali aur yeh wali dono same
          },
        },
      },
      { "dayInfo.$": 1 }
    )
      .populate("class", "-_id")
      .populate({
        path: "dayInfo.entries.timeSlot",
      })
      .populate({
        path: "dayInfo.entries.teacher",
        populate: { path: "teacherRefId" },
      });

    let check = true;

    for (let i = 0; i < result.length; i++) {
      //traversing on all classes
      const element = result[i];
      const newEntries = element.dayInfo[0].entries;

      for (let j = 0; j < newEntries.length; j++) {
        if (
          newEntries[j].timeSlot._id.toString() === tsId &&
          newEntries[j].teacher._id.toString() === teacherId
        ) {
          check = false;
        }
      }
    }

    // res.send({ result, check });
    return check;
  } catch (error) {
    return false;
  }
};

const subBelongsToTeacher = async (teacherId, subjId) => {
  console.log("inside");
  console.log(subjId, teacherId);
  const [check] = await Teacher.find({
    _id: teacherId,
    subjects: { $elemMatch: { $eq: subjId } },
  });
  if (!check) {
    return false;
  }
  return true;
};
// uss time table mai ek entry add krni hai
const addClassEntry = expressAsyncHandler(async (req, res) => {
  let { classId, inchargeId, dayName, tsId, teacherId, subjectId } = req.body;
  if (!classId || !dayName || !tsId || !teacherId || !subjectId) {
    res.send("please fill all fields");
    return;
  }
  if (!inchargeId) {
    inchargeId = null;
  }
  console.log(classId, inchargeId, dayName, tsId, teacherId, subjectId);
  // ab do cases ho skte ki ya toh dayInfo mai uss name ka day added hai iss case mai bas uss entries mai hi push krna otherwise hme uss name ka day bnana aur usme entries mai add krna pehla time slot

  let teacherAvail = await checkTeacherAvailability(
    classId,
    dayName,
    tsId,
    teacherId
  );

  // jaise teacher avail check kiya ab check kro ki jo subject id aayi kya vo teacher ke subjects mai pdi ya nhi

  try {
    if (teacherAvail === false) {
      throw new Error("Teacher is not available at this time");
    }
    const checkSubjBelongs = await subBelongsToTeacher(teacherId, subjectId);
    if (checkSubjBelongs === false) {
      throw new Error("Subject not configured to teacher");
    }
    const [classAlreadyAdded] = await ClassTimeTable.find({
      class: classId,
    });
    if (!classAlreadyAdded) {
      // means ki class nhi bni pehli baar day add aur entries add
      try {
        const result = await ClassTimeTable.create({
          class: classId,
          incharge: inchargeId,
          dayInfo: [
            {
              dayName: dayName,
              entries: [
                {
                  timeSlot: tsId,
                  teacher: teacherId,
                  subject: subjectId,
                },
              ],
            },
          ],
        });
        const createdClass = await ClassTimeTable.find({
          class: classId,
          "dayInfo.dayName": dayName,
        })
          .populate("class", "-_id")
          .populate({
            path: "dayInfo.entries.timeSlot",
            select: "-_id",
          })
          .populate({
            path: "dayInfo.entries.teacher",
            populate: { path: "teacherRefId" },
            select: "-_id",
          })
          .populate({
            path: "dayInfo.entries.subject",
            select: "-_id",
          });
        console.log("first time class is created");
        res.status(200).json(createdClass);
        return;
      } catch (error) {
        console.log("error in creation of class");
        console.log(error);
        res.status(400).send(error.message);
        return;
      }
    }

    // now we will check ki class toh added but vo day nhi added hai
    const [dayAlreadyAdded] = await ClassTimeTable.find({
      class: classId,
      dayInfo: { $elemMatch: { dayName: dayName } },
    });
    if (!dayAlreadyAdded) {
      // yha par aaye matlab dayInfo mai kuch elements added hai
      // means vo day nhi added toh uss day ki entry push krenge
      const obj = {
        dayName: dayName,
        entries: [
          {
            timeSlot: tsId,
            teacher: teacherId,
            subject: subjectId,
          },
        ],
      };
      try {
        const result = await ClassTimeTable.updateOne(
          {
            class: classId,
          },
          {
            incharge: inchargeId,
            $push: {
              dayInfo: obj,
            },
          }
        );
        const newDayCreated = await ClassTimeTable.find({
          class: classId,
          "dayInfo.dayName": dayName,
        })
          .populate("class", "-_id")
          .populate({
            path: "dayInfo.entries.timeSlot",
            select: "-_id",
          })
          .populate({
            path: "dayInfo.entries.teacher",
            populate: { path: "teacherRefId" },
            select: "-_id",
          })
          .populate({
            path: "dayInfo.entries.subject",
            select: "-_id",
          });
        console.log("new day is created in dayInfo");
        res.status(200).json(newDayCreated);
        return;
      } catch (error) {
        console.log("error in adding new day in dayInfo");
        res.status(400).send(error.message);
        return;
      }
    }
    // day add hogya matlab entries array mai bhi kuch na kuch add ho gya hai

    //   class time table mai vo entry pehli add ki hui lekin ab use hme update krna hai toh
    const [timeSlotAlreadyAdded] = await ClassTimeTable.find({
      class: classId,
      dayInfo: {
        $elemMatch: {
          dayName: dayName,
          entries: { $elemMatch: { timeSlot: tsId } },
          // "entries.timeSlot": tsId, // upar wali aur yeh wali dono same
        },
      },
      // "dayInfo.entries.timeSlot": tsId
    });
    // isme hme ek dayInfo mai document chahiye jisme dono conditions satisfy ho ki day: dayName ho aur entries mai ek aisi entry ho jisme timeSlot: id se match krta ho  toh elemMatch use kro ek array ke element  par bhut si queries simulateneously lge

    if (!timeSlotAlreadyAdded) {
      try {
        const result = await ClassTimeTable.updateOne(
          {
            class: classId,
            "dayInfo.dayName": dayName,
          },
          {
            incharge: inchargeId,
            $push: {
              "dayInfo.$.entries": {
                timeSlot: tsId,
                teacher: teacherId,
                subject: subjectId,
              },
            },
          }
        );
        const newTimeSlotCreated = await ClassTimeTable.find({
          class: classId,
          "dayInfo.dayName": dayName,
        })
          .populate("class", "-_id")
          .populate({
            path: "dayInfo.entries.timeSlot",
            select: "-_id",
          })
          .populate({
            path: "dayInfo.entries.teacher",
            populate: { path: "teacherRefId" },
            select: "-_id",
          })
          .populate({
            path: "dayInfo.entries.subject",
            select: "-_id",
          });
        console.log("new time slot is created in entries");
        res.status(200).json(newTimeSlotCreated);
        return;
      } catch (error) {
        console.log("error in adding new time slot in entries");
        res.status(400).send(error.message);
        return;
      }
    }

    // then update the entry because that time slot already existed in entries array
    try {
      let [result] = await ClassTimeTable.find({
        class: classId,
        dayInfo: {
          $elemMatch: {
            dayName: dayName,
            entries: { $elemMatch: { timeSlot: tsId } },
            // "entries.timeSlot": tsId, // upar wali aur yeh wali dono same
          },
        },
      });

      const newEntries = result.dayInfo[0].entries;

      for (let i = 0; i < newEntries.length; i++) {
        if (newEntries[i].timeSlot._id.toString() === tsId) {
          newEntries[i].teacher = teacherId;
          newEntries[i].subject = subjectId;
        }
      }

      const updatedTimeSlot = await ClassTimeTable.findOneAndUpdate(
        {
          class: classId,
          "dayInfo.dayName": dayName,
        },
        {
          $set: { "dayInfo.$.entries": newEntries },
        },
        { new: true }
      )
        .populate("class", "-_id")
        .populate({
          path: "dayInfo.entries.timeSlot",
          select: "-_id",
        })
        .populate({
          path: "dayInfo.entries.teacher",
          populate: { path: "teacherRefId" },
          select: "-_id",
        })
        .populate({
          path: "dayInfo.entries.subject",
          select: "-_id",
        });

      console.log("updated already created time slot");
      res.status(200).json(updatedTimeSlot);
      return;
    } catch (error) {
      console.log("Error", error);
      res.status(400).send(error.message);
    }
  } catch (error) {
    console.log("Error", error.message);
    res.status(400).send(error.message);
  }
});

const getIncharge = expressAsyncHandler(async (req, res) => {
  const { classId } = req.body;

  // now access only particular timeslot
  try {
    const [result] = await ClassTimeTable.find(
      {
        class: classId,
      },
      { incharge: 1, _id: 0 }
    ).populate("incharge", "-_id");

    res.status(200).json(result);
  } catch (error) {
    console.log("failed to get specific time slot");
    res.status(400).send(error.message);
  }
});

const getAllTimeSlots = expressAsyncHandler(async (req, res) => {
  const { classId, dayName, tsId } = req.body;
  if (!tsId) {
    // that means ki hme uss day ke sare time slots return krne slots ke saath hum ek array bhejenge jisme uss day ke sare slots ka start time send krenge same order mai
    try {
      const [result] = await ClassTimeTable.find(
        {
          class: classId,
          "dayInfo.dayName": dayName,
        },
        { "dayInfo.$": 1, _id: 0 }
      )
        .populate({
          path: "dayInfo.entries.timeSlot",
        })
        .populate({
          path: "dayInfo.entries.teacher",
          populate: { path: "teacherRefId", select: "-_id" },
          select: "-_id -subjects",
        })
        .populate("dayInfo.entries.subject", "-_id");
      // const [result] = await ClassTimeTable.aggregate([
      //   {
      //     $match: {
      //       class: mongoose.Types.ObjectId(classId),
      //       "dayInfo.dayName": dayName,
      //     },
      //   },
      //   {
      //     $unwind: "$dayInfo",
      //   },
      //   {
      //     $project: {
      //       class: 1,
      //       name: "$dayInfo.dayName",
      //       entries: "$dayInfo.entries",
      //     },
      //   },

      // ]);
      // await ClassTimeTable.populate(result, [
      //   {
      //     path: "entries.timeSlot",
      //     options: { sort: [{ start: -1 }] },
      //   },
      //   {
      //     path: "entries.teacher",
      //     populate: { path: "teacherRefId" },
      //     select: "-_id",
      //   },
      //   {
      //     path: "entries.subject",
      //   },
      // ]);

      // yeh logic likha taki time slots hme mile sorted order mai

      if (!result) {
        res.status(200).send({
          entries: [],
          timeSlotsStartTime: [],
        });
        return;
      }
      const obj = {
        entries: result.dayInfo[0].entries,
      };
      if (obj.entries.length === 0) {
        res.status(200).send({
          entries: [],
          timeSlotsStartTime: [],
        });
        return;
      }
      const startTimes = [];
      for (let i = 0; i < obj.entries.length; i++) {
        const element = obj.entries[i];
        let temp = element.timeSlot.start.slice(0, 2);
        if (temp[temp.length - 1] === ":") {
          temp = temp.substring(0, temp.length - 1);
        }
        startTimes.push(Number(temp));
      }

      var i, j, min_idx;
      function swap(arr, xp, yp) {
        var temp = arr[xp];
        arr[xp] = arr[yp];
        arr[yp] = temp;
      }

      for (i = 0; i < startTimes.length - 1; i++) {
        min_idx = i;
        for (j = i + 1; j < startTimes.length; j++)
          if (startTimes[j] < startTimes[min_idx]) min_idx = j;

        // Swap the found minimum element with the first element
        swap(startTimes, min_idx, i);
        swap(obj.entries, min_idx, i);
      }
      const newEntries = [];
      for (let i = 0; i < obj.entries.length; i++) {
        const element = obj.entries[i];
        const newEle = {};
        // newEle.timeSlot = element.timeSlot;
        newEle.teacherName = element.teacher.teacherRefId.name;
        newEle.tid = element.teacher.teacherRefId.tid;
        newEle.subjectName = element.subject.name;
        newEntries.push(newEle);
      }
      const finalObj = {
        entries: newEntries,
        timeSlotsStartTime: startTimes,
      };
      res.status(200).json(finalObj);
      console.log("successfully got all time slots of specific days");
      return;
    } catch (error) {
      console.log("error in getting all time slots of particular day");
      console.log(error);
      res.status(400).send(error.message);
      return;
    }
  }

  // now access only particular timeslot
  try {
    const [result] = await ClassTimeTable.find(
      {
        class: classId,
        dayInfo: {
          $elemMatch: {
            dayName: dayName,
            entries: { $elemMatch: { timeSlot: tsId } },
            // "entries.timeSlot": tsId, // upar wali aur yeh wali dono same
          },
        },
      },
      { "dayInfo.$": 1, incharge: 1, _id: 0 }
    )
      .populate({
        path: "dayInfo.entries.timeSlot",
      })
      .populate({
        path: "dayInfo.entries.teacher",
        populate: { path: "teacherRefId" },
        select: "-_id",
      })
      .populate("dayInfo.entries.subject", "-_id");

    if (!result) {
      res.status(200).send({
        entries: [],
        timeSlotsStartTime: [],
      });
      return;
    }
    const obj = {
      entries: result.dayInfo[0].entries,
    };

    let tsObj;
    for (let i = 0; i < obj.entries.length; i++) {
      const element = obj.entries[i];
      if (element.timeSlot._id.toString() === tsId) {
        tsObj = element;
        break;
      }
    }
    obj.entries = [tsObj];
    if (obj.entries.length === 0) {
      res.send({});
      return;
    }
    const newEntries = [];
    for (let i = 0; i < obj.entries.length; i++) {
      const element = obj.entries[i];
      const newEle = {};
      // newEle.timeSlot = element.timeSlot;
      newEle.teacherName = element.teacher.teacherRefId.name;
      newEle.tid = element.teacher.teacherRefId.tid;
      newEle.subjectName = element.subject.name;
      newEntries.push(newEle);
    }
    const startTimes = [];
    let temp = newEntries[0].timeSlot.start.slice(0, 2);
    if (temp[temp.length - 1] === ":") {
      temp = temp.substring(0, temp.length - 1);
    }
    startTimes.push(Number(temp));
    const finalObj = {
      entries: newEntries,
      timeSlotsStartTime: startTimes,
    };
    res.status(200).json(finalObj);
    console.log("successfully get specific time slot ");
  } catch (error) {
    console.log("failed to get specific time slot");
    res.status(400).send(error.message);
  }
});

const removeTimeSlot = expressAsyncHandler(async (req, res) => {
  const { classId, dayName, tsId } = req.body;
  console.log(classId, dayName, tsId);

  // this code only checking that which time slot we are trying to delete exist or not
  let [check] = await ClassTimeTable.find(
    {
      class: classId,
      dayInfo: {
        $elemMatch: {
          dayName: dayName,
          // "entries.timeSlot": tsId, // upar wali aur yeh wali dono same
        },
      },
    },
    { "dayInfo.$": 1 }
  );

  const entries = check.dayInfo[0].entries;
  let flag = false;
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].timeSlot._id.toString() === tsId) {
      flag = true;
    }
  }
  if (flag == false) {
    res.status(200).send("this time slot not exists");
    return;
  }
  console.log(flag);

  try {
    let [result] = await ClassTimeTable.find({
      class: classId,
      dayInfo: {
        $elemMatch: {
          dayName: dayName,
          entries: { $elemMatch: { timeSlot: tsId } },
          // "entries.timeSlot": tsId, // upar wali aur yeh wali dono same
        },
      },
    });

    const newEntries = result.dayInfo[0].entries;
    console.log(newEntries);

    for (let i = 0; i < newEntries.length; i++) {
      if (newEntries[i].timeSlot._id.toString() === tsId) {
        newEntries.splice(i, 1);
      }
    }
    console.log("after removing entry : ", newEntries);
    // after deletion the updatedTimeSlot
    const updatedTimeSlot = await ClassTimeTable.findOneAndUpdate(
      {
        class: classId,
        "dayInfo.dayName": dayName,
      },
      {
        $set: { "dayInfo.$.entries": newEntries },
      },
      { new: true }
    ).populate("class", "-_id");
    // .populate({
    //   path: "dayInfo.entries.timeSlot",
    //   select: "-_id",
    // })
    // .populate({
    //   path: "dayInfo.entries.teacher",
    //   populate: { path: "teacherRefId" },
    //   select: "-_id",
    // })
    // .populate({
    //   path: "dayInfo.entries.subject",
    //   select: "-_id",
    // });
    console.log(updatedTimeSlot);
    console.log("successfully remove the time slot ");
    res.status(200).json(updatedTimeSlot);
    return;
  } catch (error) {
    console.log("error in removing that time slot", error);
    res.status(400).send(error.message);
  }
});

module.exports = {
  addClassEntry,
  getAllTimeSlots,
  removeTimeSlot,
  getIncharge,
  checkTeacherAvailability,
  subBelongsToTeacher,
};
