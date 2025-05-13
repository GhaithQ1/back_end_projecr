const mongoose = require("mongoose");

const post_6_Schema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "user"
  },

ifrem:
  {
    url:String,
    des:String,
  }
,
  

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
    default: "post_6",
    required: true
  }

}, { timestamps: true });

const post_6_model = mongoose.model("post_6", post_6_Schema);

module.exports = post_6_model;
