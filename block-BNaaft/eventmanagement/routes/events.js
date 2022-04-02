const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Events = require("../models/events");
const Category = require("../models/category");
const { events } = require("../models/events");
const Remarks = require("../models/remarks");

router.get("/new", (req, res) => {
  res.render("eventform");
});

router.post("/", (req, res, next) => {
  let categoryData = {};
  categoryData.name = req.body["event_category"];
  Events.create(req.body, (err, event) => {
    categoryData.eventId = event._id;
    Category.create(categoryData, (err, category) => {
      Events.findByIdAndUpdate(
        event._id,
        { $push: { eventcategory: category._id } },
        { new: true },
        (err, upadtedevent) => {
          if (err) return next(err);
          console.log(upadtedevent);
          res.render("index");
        }
      );
    });
  });
});

router.get("/", (req, res) => {
  Events.find({})
    .populate("eventcategory")
    .exec((err, events) => {
      // render all  the distnict  categories and locations in the sidebar
      Category.find({}, (err, categories) => {
        const distnictCategories = [...new Set(categories.map((c) => c.name))];
        Events.find({}, (err, allevents) => {
          const distnictLocations = [
            ...new Set(allevents.map((e) => e.location)),
          ];
          console.log(distnictLocations);
          res.render("allevents", {
            events: events,
            categories: distnictCategories,
            locations: distnictLocations,
          });
        });
      });
    });
});

// Get a single  event detail
router.get("/:id", (req, res) => {
  let id = req.params.id;
  Events.findById(id)
    .populate("eventcategory")
    .populate("remarks")
    .exec((err, event) => {
      // render all  the distnict  categories
      Category.find({}, (err, categories) => {
        const distnictCategories = [...new Set(categories.map((c) => c.name))];
        Events.find({}, (err, allevents) => {
          const distnictLocations = [
            ...new Set(allevents.map((e) => e.location)),
          ];
          console.log(distnictLocations);
          res.render("detailedevent", {
            event: event,
            categories: distnictCategories,
            locations: distnictLocations,
          });
        });
      });
    });
});

// edit  the event detail again
router.get("/:id/edit", (req, res) => {
  let id = req.params.id;
  Events.findById(id)
    .populate("eventcategory")
    .exec((err, event) => {
      res.render("editevent", { event: event });
    });
});
//update the event detail on this route  - events/:id  post request on this one
router.post("/:id/", (req, res, next) => {
  let id = req.params.id;
  categoryName = req.body["event_category"];
  Events.findByIdAndUpdate(id, req.body, { new: true }, (err, upadtedEvent) => {
    Category.findByIdAndUpdate(
      id,
      { name: categoryName },
      { new: true },
      (err, updatedcategory) => {
        if (err) return next(err);
        res.redirect("/events");
      }
    );
  });
});

//delete  the event and delete its all the references
router.get("/:id/delete", (req, res, next) => {
  let id = req.params.id;
  Events.findByIdAndDelete(id, { new: true }, (err, deletedEvent) => {
    Category.deleteOne(
      { eventId: id },
      { new: true },
      (err, deletedcategory) => {
        Remarks.deleteOne(
          { eventId: id },
          { new: true },
          (err, deletedcategory) => {
            if (err) return next(err);
            res.redirect("/events");
          }
        );
      }
    );
  });
});

// Performing  the like and dislike functionality on the every event
router.get("/:id/like", (req, res, next) => {
  let id = req.params.id;
  Events.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    { new: true },
    (err, event) => {
      if (err) return next(err);
      res.redirect(`/events/${id}`);
    }
  );
});

//once dislike is  clicked then it will decrese on more like from the event
router.get("/:id/dislike", (req, res, next) => {
  let id = req.params.id;
  Events.findById(id, (err, event) => {
    if (event.likes > 0) {
      Events.findByIdAndUpdate(
        id,
        { $inc: { likes: -1 } },
        { new: true },
        (err, event) => {
          if (err) return next(err);
          res.redirect(`/events/${id}`);
        }
      );
    } else {
      res.redirect(`/events/${id}`);
    }
  });
});

// Adding the remarks
router.post("/:id/remark", (req, res, next) => {
  let id = req.params.id;
  req.body.eventId = id;
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

// Increment Remark like
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

//Decrement Remark like
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

//Request on the a specific category
router.get("/:category_name/category", (req, res) => {
  let categoryName = req.params.category_name;
  Category.find({ name: categoryName })
    .populate("eventId")
    .exec((err, events) => {
      Category.find({}, (err, categories) => {
        const distnictCategories = [...new Set(categories.map((c) => c.name))];
        Events.find({}, (err, allevents) => {
          const distnictLocations = [
            ...new Set(allevents.map((e) => e.location)),
          ];
          console.log(distnictLocations);
          res.render("categoryEvents", {
            events: events,
            categories: distnictCategories,
            locations: distnictLocations,
          });
        });
      });
    });
});

// /events/<%= cv%>/location

// render all the events based on a specific location
router.get("/:location_name/location", (req, res) => {
  let locationName = req.params.location_name;
  Events.find({ location: locationName })
    .populate("eventcategory")
    .exec((err, events) => {
      Category.find({}, (err, categories) => {
        const distnictCategories = [...new Set(categories.map((c) => c.name))];
        Events.find({}, (err, allevents) => {
          const distnictLocations = [
            ...new Set(allevents.map((e) => e.location)),
          ];
          console.log(distnictLocations);
          res.render("locationEvents", {
            events: events,
            categories: distnictCategories,
            locations: distnictLocations,
          });
        });
      });
    });
});
module.exports = router;
