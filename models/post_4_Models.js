const mongoose = require("mongoose");

const post_4_Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "user", // ارتباط بالمستخدم
  },
  questions: [
    {
      img: { type: String, required: true }, // اسم الصورة المرتبطة بالسؤال
      word_1: { type: String, required: true }, // الكلمة الأولى
      word_2: { type: String, required: true }, // الكلمة الثانية
      word_3: { type: String, required: true }, // الكلمة الثالثة
      word_4: { type: String, required: true }, // الكلمة الرابعة
      correctWord: { type: String, required: true }, // الكلمة الصحيحة
    },
  ],
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "user", // المستخدمين الذين أعجبهم المنشور
    },
  ],
  comments: [
    {
      comment: String, // نص التعليق
      user_comment: {
        type: mongoose.Schema.ObjectId,
        ref: "user", // المستخدم الذي كتب التعليق
      },
    },
  ],
  type: {
    type: String,
    default: "post_4", // نوع المنشور
    required: true,
  },
}, { timestamps: true }); // حفظ تاريخ الإنشاء والتحديث

const post_4_model = mongoose.model("post_4", post_4_Schema);

module.exports = post_4_model;