const { check, body } = require("express-validator");
const validationMiddiel = require("./validationResulte");
const usermodel = require("../models/userModels");

exports.create_user_V = [
    check("name")
    .notEmpty().withMessage("Please enter your name"),

    check("email")
    .notEmpty().withMessage("Please enter your email address")
    .isEmail().withMessage("Invalid email")
    .custom((val) =>
        usermodel.findOne({ email: val }).then((user) => {
            if (user) {
                throw new Error("Email already in use");
            }
        })
    ),

    check("phone")
    .optional()
    .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA"]).withMessage("Invalid phone number"),

    check("password")
    .notEmpty().withMessage("Please enter your password")
    .isLength({ min: 5 }).withMessage("The password is too short"),

    check("role")
    .notEmpty().withMessage("Please enter the role"),

    check("passwordConfirm")
    .notEmpty().withMessage("Please confirm your password")
    .custom((val, { req }) => {
        if (val !== req.body.password) {
            throw new Error("Password does not match");
        }
        return true;
    }),

    validationMiddiel
];

exports.get_user_ID_V = [
    check("id")
    .isMongoId().withMessage("Invalid user ID"),
    validationMiddiel
];

exports.update_user_V = [

    check("name")
        .notEmpty().withMessage("You must add your name")

    ,
    validationMiddiel
];

exports.delete_user_V = [
    check("id")
    .isMongoId().withMessage("Invalid user ID"),
    validationMiddiel
];

exports.update_password_user_V = [
    check("id")
    .isMongoId().withMessage("Invalid user ID"),

    check("password")
    .notEmpty().withMessage("Please enter your new password."),

    check("passwordConfirm")
    .notEmpty().withMessage("Please confirm your password.")
    .custom((val, { req }) => {
        if (val !== req.body.password) {
            throw new Error("Password does not match");
        }
        return true;
    }),

    validationMiddiel
];

exports.create_addresses_user_V = [
    check("address_location")
    .notEmpty().withMessage("Please enter the location"),

    check("details")
    .notEmpty().withMessage("Please enter address details"),

    check("phone")
    .optional()
    .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA"]).withMessage("Invalid phone number"),

    validationMiddiel
];

exports.delete_addresses_user_V = [
    check("addressesid")
    .isMongoId().withMessage("Invalid address ID"),
    validationMiddiel
];

exports.create_wichlist_user_V = [
    check("productid")
    .notEmpty().withMessage("Please enter the product")
    .isMongoId().withMessage("Invalid ID"),
    validationMiddiel
];

exports.delete_wichlist_user_V = [
    check("productid")
    .notEmpty().withMessage("Please enter the product")
    .isMongoId().withMessage("Invalid ID"),
    validationMiddiel
];
