const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Events = require("../models/events");
const Category = require("../models/category");
const { events } = require("../models/events");
const Remarks = require("../models/remarks");

//most used  variable thourghout the project

// Filter the data between the start date and end date as given by  the user  handle events/datedata route here

router.post("/datedata", (req, res, next) => {
  req.body.startdate = new Date(req.body.startdate);
  req.body.enddate = new Date(req.body.enddate);
  let startDate = req.body.startdate;
  let endDate = req.body.enddate;
  Events.find({
    start_date: { $gte: startDate },
    end_date: { $lt: endDate },
  })
    .populate("eventcategory")
    .exec((err, events) => {
      // render all  the distnict  categories and locations in the sidebar
      if (err) {
        return res.redirect("/events");
      }
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

// render a form once the user click on the new event button
router.get("/new", (req, res) => {
  res.render("eventform");
});

//store the data in the database once the user submits a form
router.post("/", (req, res, next) => {
  let categoryData = {};
  categoryData.name = req.body["event_category"];
  Events.create(req.body, (err, event) => {
    if (err) return res.redirect("/events/new");
    categoryData.eventId = event._id;
    Category.create(categoryData, (err, category) => {
      Events.findByIdAndUpdate(
        event._id,
        { $push: { eventcategory: category._id } },
        { new: true },
        (err, upadtedevent) => {
          // if(err) {
          //   res.redirect('/events');
          // }
          console.log(upadtedevent);
          res.redirect("/events");
        }
      );
    });
  });
});

router.get("/", async (req, res) => {
  try {
    const allevents = await Events.find({});
    const categories = await Category.find({});
    const distnictCategories = [...new Set(categories.map((c) => c.name))];
    const distnictLocations = [...new Set(allevents.map((l) => l.location))];
    // if the user wants  all the events based on some location
    if (req.query.location) {
      let locationName = req.query.location;
      const events = await Events.find({ location: locationName }).populate(
        "eventcategory"
      );
      res.render("locationEvents", {
        events: events,
        categories: distnictCategories,
        locations: distnictLocations,
      });
    }

    // if the user  wants  all events based on  a category
    if (req.query.category) {
      let categoryName = req.query.category;
      const events = await Category.find({ name: categoryName }).populate(
        "eventId"
      );
      res.render("categoryEvents", {
        events: events,
        categories: distnictCategories,
        locations: distnictLocations,
      });
    }
    // if  no filter is applied then all the events are shown on the webpage
    res.render("locationEvents", {
      events: allevents,
      categories: distnictCategories,
      locations: distnictLocations,
    });
  } catch (err) {
    res.redirect("/events");
  }
});

// Get a single  event detail
router.get("/:id", async (req, res) => {
  try {
    let id = req.params.id;

    const allevents = await Events.find({});
    const categories = await Category.find({});
    const distnictCategories = [...new Set(categories.map((c) => c.name))];
    const distnictLocations = [...new Set(allevents.map((l) => l.location))];

    let event = await Events.findById(id).populate("eventcategory");
    res.render("detailedevent", {
      event: event,
      categories: distnictCategories,
      locations: distnictLocations,
    });
  } catch (err) {
    res.redirect("/events");
  }
});

// get the form to edit  the event detail
router.get("/:id/edit", async (req, res) => {
  try {
    let id = req.params.id;
    let event = await Events.findById(id).populate("eventcategory");
    res.render("editevent", { event: event });
  } catch (err) {
    res.redirect("/events");
  }
});
//update the event detail
router.post("/:id/", async (req, res, next) => {
  try {
    let id = req.params.id;
    let categoryName = req.body["event_category"];
    let event = await Events.findByIdAndUpdate(id, req.body, { new: true });
    // updating the category also
    let category = await Category.findByIdAndUpdate(
      { eventId: id },
      { name: categoryName },
      { new: true }
    );
    res.redirect("/events");
  } catch (err) {
    res.redirect("/events");
  }
});

//delete  the event and delete its all the references
router.get("/:id/delete", async (req, res) => {
  try {
    let id = req.params.id;
    let deleteEvent = await Events.findByIdAndDelete(id, { new: true });
    let deleteCategory = await Category.deleteOne(
      { eventId: id },
      { new: true }
    );
    let deleteRemarks = await Remarks.deleteOne({ eventId: id }, { new: true });
    res.redirect("/events");
  } catch (err) {
    res.redirect("/events");
  }
});

//Increses the like of every button once the increse like button is clicked
router.get("/:id/like", async (req, res) => {
  try {
    let id = req.params.id;
    let increseLikes = await Events.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.redirect("/events/" + id);
  } catch (err) {
    res.redirect("/events");
  }
});

//decrese  events like
router.get("/:id/dislike", async (req, res) => {
  try {
    let id = req.params.id;
    let event = await Events.findById(id);
    if (event.likes > 0) {
      let decreaseLikes = await Events.findByIdAndUpdate(
        id,
        { $inc: { likes: -1 } },
        { new: true }
      );
      res.redirect("/events/" + id);
    }
    res.redirect("/events/" + id);
  } catch (err) {
    res.redirect("/events");
  }
});

module.exports = router;
