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
//render a form  to edit  the remarks detail
router.get("/remarks/:id/edit", (req, res, next) => {
  let id = req.params.id;
  Remarks.findById(id, (err, remark) => {
    if (err) return next(err);
    res.render("editremarks", { remark: remark });
  });
});

//edit the  remark of a event
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


// Increment Remarks like  we are getting  the remarks id form the url bar
router.get("/:id/:event/like/", (req, res, next) => {
  let id = req.params.id;
  let eventid = req.params.event;
  Remarks.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    { new: true },
    (err, event) => {
      if (err) return next(err);
      res.redirect(`/events/${eventid}`);
    }
  );
});

//Decrement Remarks like we are getting the data form  url bar
router.get("/:id/:event/dislike", (req, res, next) => {
  let id = req.params.id;
  let eventId = req.params.event;
  Remarks.findById(id, (err, event) => {
    if (event.likes > 0) {
      Remarks.findByIdAndUpdate(
        id,
        { $inc: { likes: -1 } },
        { new: true },
        (err, event) => {
          if (err) return next(err);
          res.redirect(`/events/${eventId}`);
        }
      );
    } else {
      res.redirect(`/events/${eventId}`);
    }
  });
});




module.exports = router;
