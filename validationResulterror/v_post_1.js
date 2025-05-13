const { check, body,validationResult } = require("express-validator");
const validationMiddiel = require("./validationResulte");
const Post = require("../models/post_1_Models");
const { mongo } = require("mongoose");


// =================================================================
exports.createPost_V = [
  body().custom((body) => {
    if (!body.writing && !body.img_post && !body.video_post) {
      throw new Error("The entry must contain at least one text, image, or video.");
    }
    return true;
  }),
  validationMiddiel,
];

exports.createPost_1_V = [
  // التحقق من الكلمات داخل مصفوفة boxes
  (req, res, next) => {
    const errors = validationResult(req).array();

    // التحقق من وجود البيانات المرسلة في الحقل boxes
    if (!req.body.boxes || !Array.isArray(req.body.boxes) || req.body.boxes.length === 0) {
      errors.push({ path: "boxes", msg: "Add at least one box" });
    } else {
      // التحقق من كل عنصر داخل مصفوفة boxes
      req.body.boxes.forEach((box, index) => {
        if (!box.word) {
          errors.push({ path: `boxes[${index}][word]`, msg: `Add a word for box ${index + 1}` });
        }
      });
    }

    next();
  },

  // middleware يدوي لفحص الصور والملفات الصوتية
  (req, res, next) => {
    const errors = validationResult(req).array();

    if (req.files && req.files.length > 0) {
      req.body.boxes.forEach((box, index) => {
        const postImageField = `boxes[${index}][postImage]`;
        const audioField = `boxes[${index}][audio]`;

        const imageExists = req.files.some((file) => file.fieldname === postImageField);
        const audioExists = req.files.some((file) => file.fieldname === audioField);

        if (!imageExists) {
          errors.push({ path: postImageField, msg: `Add an image for box ${index + 1}` });
        }

        if (!audioExists) {
          errors.push({ path: audioField, msg: `Add an audio file for box ${index + 1}` });
        }
      });
    } else {
      errors.push({ path: "files", msg: "No files uploaded." });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  },

  // التأكد من إرسال النتيجة النهائية بعد التحقق
  validationMiddiel,
];




exports.createPost_2_V = [
  body("questions.*")
    .isObject()
    .withMessage("Each question must be an object with question and answers."),

  (req, res, next) => {
    const questions = req.body.questions;

    if (!Array.isArray(questions)) {
      return next(); // let express-validator handle the type error
    }

    const errors = [];

    questions.forEach((q, index) => {
      if (
        !q.question?.trim() ||
        !q.Answer_1?.trim() ||
        !q.Answer_2?.trim() ||
        !q.Answer_3?.trim() ||
        !q.Answer_4?.trim()
      ) {
        errors.push({
          msg: `Please complete all fields in question #${index + 1} (question and 4 answers).`,
          path: `questions[${index}]`,
        });
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  },
];




exports.createPost_3_V = [
  body("questions").isArray({ min: 1 }).withMessage("At least one question must be added."),

  body("questions.*.question")
    .notEmpty()
    .withMessage("Each question must contain text"),

  body("questions.*.condition")
    .not()
    .isEmpty()
    .withMessage("You must determine whether the answer is true or false."),

  validationMiddiel,
];



exports.createPost_4_V = [
  body("questions")
    .isArray({ min: 1 })
    .withMessage("At least one question must be added."),

  body("questions.*.img")
    .notEmpty()
    .withMessage("Each question must include an image."),

  body("questions").custom((questions) => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.word_1 || !q.word_2 || !q.word_3 || !q.word_4) {
        throw new Error("All four word fields (word_1 to word_4) must be filled for each question.");
      }
    }
    return true;
  }),

  validationMiddiel,
];






exports.createPost_6_V = [
  check('url')
    .notEmpty().withMessage("You must add URL")
    .isURL().withMessage("The URL must be valid"),
  validationMiddiel,
];

exports.create_post_comments_V = [
  check("comment")
  .notEmpty().whitelist("A comment must be added.")
  ,
  validationMiddiel,
]























exports.deletePost_1_V = [
  check("id")
    .isMongoId()
    .withMessage("Post not found")
    .custom((val) =>
      Post.findById(val).then((post) => {
        if (!post) {
          throw new Error(`Post not found id: ${val}`);
        }
      })
    ),
  validationMiddiel,
];
