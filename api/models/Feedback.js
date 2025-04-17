const mongoose = require("mongoose");
const { Schema } = mongoose;

const FeedbackSchema = new Schema({
  name: String,
  email: String,
  event: String,
  message: String,
  rating: Number,
  date: { type: Date, default: Date.now },
});

const FeedbackModel = mongoose.model("Feedback", FeedbackSchema);

module.exports = FeedbackModel;
