const mongoose = require("mongoose");

const post_1_Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
  },

  boxes: [
    {
      postImage: String, // الصورة الخاصة بالـ box
      word: String,      // الكلمة المرتبطة بالـ box
      postAudio: String,     // رابط ملف الصوت الخاص بالـ box
    },
  ],

  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
  ],

  comments: [
    {
      comment: String,
      user_comment: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    },
  ],

  type: {
    type: String,
    default: "post_1",
    required: true,
  },
},
{ timestamps: true });

const post_1_model = mongoose.model("post_1", post_1_Schema);

module.exports = post_1_model;