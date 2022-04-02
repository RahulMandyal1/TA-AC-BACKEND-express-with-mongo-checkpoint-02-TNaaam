const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    host: {
      type: String,
      required: true,
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
    eventcategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    location: String,
    remarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Remark",
      },
    ],
  },
  { timestamps: true }
);
let Event = mongoose.model("Event", eventSchema);
module.exports = Event;
