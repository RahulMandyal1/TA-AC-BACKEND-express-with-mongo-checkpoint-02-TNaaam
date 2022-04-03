const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Events = require("../models/events");
const Category = require("../models/category");
const { events } = require("../models/events");
const Remarks = require("../models/remarks");


// Adding the remarks
router.post("/:id/remark", (req, res, next) => {
  let id = req.params.id;
  req.body.eventId = id;
  if (req.body.content.length === 0) return res.redirect("/events/" + id);
  Remarks.create(req.body, (err, remark) => {
    Events.findByIdAndUpdate(
      id,
      { $push: { remarks: remark._id } },
      { new: true },
      (err, upadtedevent) => {
        if (err) return next(err);
        console.log(upadtedevent);
        res.redirect(`/events/${id}`);
      }
    );
  });
});
//get a form to edi the remark  made on a event
// /events/remarks/<%=cv._id%>/edit
router.get("/remarks/:id/edit", (req, res, next) => {
  let id = req.params.id;
  Remarks.findById(id, (err, remark) => {
    if (err) return next(err);
    res.render("editremarks", { remark: remark });
  });
});

//edit the remark made on a specific events /events/remarks/:id
router.post("/remarks/:id", (req, res, next) => {
  let id = req.params.id;
  Remarks.findByIdAndUpdate(
    id,
    { $set: { author: req.body.author, content: req.body.content } },
    { new: true }
  ).exec((err, updatedremark) => {
    if (req.body.content.length === 0)
      return res.redirect('/events');
    res.redirect(`/events/${updatedremark.eventId}`);
  });
});

//delete the remark on a event
router.get("/remarks/:id/delete", (req, res, next) => {
  let id = req.params.id;
  Remarks.findByIdAndDelete(id, (err, remark) => {
    if (err) return next(err);
    res.redirect(`/events/${remark.eventId}`);
  });
});



module.exports = router;
