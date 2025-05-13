const mongoose = require("mongoose");

const post_2_Schema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "user"
  },

  questions: [
    {
      question: { type: String, required: true },
      Answer_1: { type: String, required: true },
      Answer_2: { type: String, required: true },
      Answer_3: { type: String, required: true },
      Answer_4: { type: String, required: true },
      correctAnswer: { type: String, required: true }, // 👈 أضف هذا
    }
  ],
  

  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "user"
    }
  ],

  comments: [
    {
      comment: String,
      user_comment: {
        type: mongoose.Schema.ObjectId,
        ref: "user"
      }
    }
  ],

  type: {
    type: String,
    default: "post_2",
    required: true
  }

}, { timestamps: true });

const post_2_model = mongoose.model("post_2", post_2_Schema);

module.exports = post_2_model;
