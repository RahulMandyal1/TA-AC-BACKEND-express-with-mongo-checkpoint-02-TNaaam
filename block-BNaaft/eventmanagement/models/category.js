const mongoose = require("mongoose");

let categorySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  eventId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
});

let Category = mongoose.model("Category", categorySchema);
module.exports = Category;
