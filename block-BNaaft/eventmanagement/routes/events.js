const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Events = require("../models/events");
const Category = require("../models/category");
const { events } = require("../models/events");
const Remarks = require("../models/remarks");



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
    if(err) return res.redirect('/events/new');
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

// get the form to edit  the event detail
router.get("/:id/edit", (req, res) => {
  let id = req.params.id;
  Events.findById(id)
    .populate("eventcategory")
    .exec((err, event) => {
      res.render("editevent", { event: event });
    });
});
//update the event detail 
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
        res.redirect("/events/");
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

//Increses the like of every button once the increse like button is clicked
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

//decrese  events like 
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

//Get all the data of same category once the use click on that category
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

//Filter the data from the database as per location provided by the user here we are 
//getting  the data based on a particular location .
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
