const { check, body } = require("express-validator");

const validationMiddiel = require("./validationResulte");

const usermodel = require("../models/userModels");

const slugify = require("slugify");
const bcrypt = require("bcryptjs");

exports.sign_up_V = [
    check("name")
        .notEmpty().withMessage("You must enter your name."),

    check("email")
        .notEmpty().withMessage("You must enter your email address.")
        .isEmail().withMessage("Invalid email")
        .custom((val) =>
            usermodel.findOne({ email: val }).then((user) => {
                if (user) {
                    throw new Error("Email already in use");
                }
            })
        ),

    check("password")
        .notEmpty().withMessage("Password must be entered")
        .isLength({ min: 5 }).withMessage("Short password"),

    check("passwordConfirm")
        .notEmpty().withMessage("You must enter a password confirmation.")
        .custom((val, { req }) => {
            if (val !== req.body.password) {
                throw new Error("Password does not match");
            }

            return true;
        }),

    validationMiddiel
];

exports.login_V = [
    // لا حاجة للتحقق من البريد الإلكتروني وكلمة المرور هنا لأننا نستخدم الجلسة في تطبيقات الاستيثاق الحديثة
    validationMiddiel
];

exports.update_user_my_V = [
    check("name")
        .notEmpty().withMessage("You must enter your name."),

    check("phone")
        .optional()
        .isMobilePhone(["es-ES"]).withMessage("Invalid phone number must be a Spanish number"),

    validationMiddiel
];

exports.update_user_password_my_V = [
    check("password")
        .notEmpty().withMessage("You must enter your current password.")
        .custom(async (val, { req }) => {
            const user = await usermodel.findById(req.user._id);

            if (!user) {
                throw new Error("User not found");
            }

            const pass = await bcrypt.compare(val, user.password);

            if (!pass) {
                throw new Error("The current password is incorrect.");
            }

            return true;
        }),

    check("newpassword")
        .notEmpty().withMessage("A new password must be entered."),

    check("newpasswordConfirm")
        .notEmpty().withMessage("You must enter a new password confirmation.")
        .custom((val, { req }) => {
            if (val !== req.body.newpassword) {
                throw new Error("The new password does not match.");
            }

            return true;
        }),

    validationMiddiel
];

exports.forgotpassord_V = [
    check("email")
        .notEmpty().withMessage("You must enter your email address.")
        .custom((val) =>
            usermodel.findOne({ email: val }).then((user) => {
                if (!user) {
                    throw new Error("Email not found");
                }
            })
        ),

    validationMiddiel
];

exports.receiveAndSendEmailMe_v = [
    check("email")
        .notEmpty().withMessage("You must enter your email address.")
        .isEmail().withMessage("Please enter a valid email address."),

    check("subject")
        .notEmpty().withMessage("Subject must be entered"),

    check("message")
        .notEmpty().withMessage("The message must be entered."),

    validationMiddiel
];
