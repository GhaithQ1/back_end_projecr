const mongoose = require("mongoose");

const post_3_Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
  },

  questions: [
    {
      question: String,
      condition: Boolean,
    }
  ],

  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    }
  ],

  comments: [
    {
      comment: String,
      user_comment: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    }
  ],

  type: {
    type: String,
    default: "post_3",
    required: true,
  },
}, { timestamps: true });

const post_3_model = mongoose.model("post_3", post_3_Schema);

module.exports = post_3_model;
