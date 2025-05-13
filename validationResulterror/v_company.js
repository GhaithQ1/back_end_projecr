const { check, body } = require("express-validator");
const validationMiddiel = require("./validationResulte");

const companymodel = require("../models/companyModels");
const Categoreymodel = require("../models/CategoreyModels");
const usermodel = require("../models/userModels");
const Company_requestsmodel = require("../models/Company_requestsModels");

function isValidLinkedInURL(value) {
    const regex = /^(https?:\/\/)?(www\.)?(linkedin\.com\/in\/[a-zA-Z0-9-]+)/;
    return regex.test(value);
}

function isValidFacebookURL(value) {
    const regex = /^(https?:\/\/)?(www\.)?(facebook\.com\/[a-zA-Z0-9.]+)/;
    return regex.test(value);
}

function isValidInstagramURL(value) {
    const regex = /^(https?:\/\/)?(www\.)?(instagram\.com\/[a-zA-Z0-9._]+)/;
    return regex.test(value);
}

exports.create_company_V = [
    check("name")
        .notEmpty().withMessage("أدخل اسم شركتك"),

    check("description")
        .notEmpty().withMessage("أدخل وصفًا لشركتك.")
        .isLength({ min: 15 }).withMessage("وصف الشركة قصير."),

    check("companyImage")
        .notEmpty().withMessage("أدخل صورة لشركتك."),

    check("logoImage")
        .notEmpty().withMessage("أدخل شعار شركتك"),

    check("phone")
        .notEmpty().withMessage("أدخل رقم هاتفك")
        .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA", "ar-SA", "ar-QA", "ar-KW", "ar-OM", "ar-JO", "ar-LB", "ar-DJ", "ar-MR", "ar-PS", "ar-TN", "ar-YE", "ar-IQ", "ar-SD", "ar-LY"])
        .withMessage("رقم الهاتف غير صالح. يجب أن يكون رقم هاتف عربي صالح."),

    check("linkedIn")
        .custom(value => {
            if (value && !isValidLinkedInURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط LinkedIn صالح.");
            }
            return true;
        }),

    check("facebook")
        .custom(value => {
            if (value && !isValidFacebookURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط Facebook صالح.");
            }
            return true;
        }),

    check("instagram")
        .custom(value => {
            if (value && !isValidInstagramURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط Instagram صالح.");
            }
            return true;
        }),

    check("email")
        .notEmpty().withMessage("أدخل بريدك الإلكتروني")
        .isEmail().withMessage("البريد الإلكتروني غير صالح"),

    check("categorey")
        .notEmpty().withMessage("أدخل تصنيفًا لشركتك")
        .isMongoId().withMessage("خطأ في الـ id")
        .custom((val) =>
            Categoreymodel.findById(val).then((Categorey) => {
                if (!Categorey) {
                    throw new Error(`لا يوجد تصنيف لهذا الـ id: ${val}`);
                }
            })
        ),

    check("user")
        .notEmpty().withMessage("أدخل الـ id للمستخدم")
        .isMongoId().withMessage("خطأ في الـ id")
        .custom((val) =>
            usermodel.findById(val).then((user) => {
                if (!user) {
                    throw new Error(`لا يوجد مستخدم لهذا الـ id: ${val}`);
                }
            })
        ),

    check("Country")
        .notEmpty().withMessage("أدخل دولتك"),

    check("subscriptionType")
        .notEmpty().withMessage("حدد نوع الاشتراك")
        .isIn(["سنوي", "ثلاث شهور", "شهري"]).withMessage("نوع الاشتراك غير صالح"),

    validationMiddiel
];

exports.update_company_my_V = [
    check("linkedIn")
        .optional()
        .custom(value => {
            if (value && !isValidLinkedInURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط LinkedIn صالح.");
            }
            return true;
        }),

    check("facebook")
        .optional()
        .custom(value => {
            if (value && !isValidFacebookURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط Facebook صالح.");
            }
            return true;
        }),

    check("instagram")
        .optional()
        .custom(value => {
            if (value && !isValidInstagramURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط Instagram صالح.");
            }
            return true;
        }),

    check("name")
        .notEmpty().withMessage("أدخل اسم شركتك"),

    check("description")
        .notEmpty().withMessage("أدخل وصفًا لشركتك.")
        .isLength({ min: 15 }).withMessage("وصف الشركة قصير."),

    check("phone")
        .notEmpty().withMessage("أدخل رقم هاتفك")
        .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA", "ar-SA", "ar-QA", "ar-KW", "ar-OM", "ar-JO", "ar-LB", "ar-DJ", "ar-MR", "ar-PS", "ar-TN", "ar-YE", "ar-IQ", "ar-SD", "ar-LY"])
        .withMessage("رقم الهاتف غير صالح. يجب أن يكون رقم هاتف عربي صالح."),

    check("Country")
        .notEmpty().withMessage("أدخل دولتك"),

    validationMiddiel
];

exports.update_company_id_V = [
    check("id")
        .isMongoId().withMessage("هناك خطأ في الـ id")
        .custom((val) =>
            companymodel.findById(val).then((company) => {
                if (!company) {
                    throw new Error(`لا يوجد حساب شركة لهذا الـ id ${val}`);
                }
            })
        ),

    check("name")
        .notEmpty().withMessage("أدخل اسم شركتك"),

    check("description")
        .notEmpty().withMessage("أدخل وصفًا لشركتك.")
        .isLength({ min: 15 }).withMessage("وصف الشركة قصير."),

    check("phone")
        .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA", "ar-SA", "ar-QA", "ar-KW", "ar-OM", "ar-JO", "ar-LB", "ar-DJ", "ar-MR", "ar-PS", "ar-TN", "ar-YE", "ar-IQ", "ar-SD", "ar-LY"])
        .withMessage("رقم الهاتف غير صالح. يجب أن يكون رقم هاتف عربي صالح."),

    check("linkedIn")
        .optional()
        .custom(value => {
            if (value && !isValidLinkedInURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط LinkedIn صالح.");
            }
            return true;
        }),

    check("facebook")
        .optional()
        .custom(value => {
            if (value && !isValidFacebookURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط Facebook صالح.");
            }
            return true;
        }),

    check("Country")
        .notEmpty().withMessage("أدخل دولتك"),

    check("email")
        .notEmpty().withMessage("أدخل بريدك الإلكتروني")
        .isEmail().withMessage("البريد الإلكتروني غير صالح"),

    check("instagram")
        .optional()
        .custom(value => {
            if (value && !isValidInstagramURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط Instagram صالح.");
            }
            return true;
        }),

    validationMiddiel
];

exports.get_company_id_V = [
    check("id")
        .isMongoId().withMessage("هناك خطأ في الـ id")
        .custom((val) =>
            companymodel.findById(val).then((company) => {
                if (!company) {
                    throw new Error(`لا يوجد حساب شركة لهذا الـ id: ${val}`);
                }
            })
        ),

    validationMiddiel
];

exports.delete_company_id_V = [
    check("id")
        .isMongoId().withMessage("هناك خطأ في الـ id")
        .custom((val) =>
            companymodel.findById(val).then((company) => {
                if (!company) {
                    throw new Error(`لا يوجد حساب شركة لهذا الـ id: ${val}`);
                }
            })
        ),

    validationMiddiel
];

exports.create_company_advertisements_my_V = [
    check("Image")
        .optional(),

    check("title")
        .notEmpty().withMessage("يجب إدخال عنوان الإعلان"),

    check("description")
        .notEmpty().withMessage("يجب إدخال تفاصيل الإعلان"),

    validationMiddiel
];

exports.delete_company_advertisements_my_V = [
    check("id")
        .isMongoId().withMessage("هناك خطأ في الـ id"),

    validationMiddiel
];

exports.create_company_comments_V = [
    check("id")
        .isMongoId().withMessage("هناك خطأ في الـ id")
        .custom((val) =>
            companymodel.findById(val).then((company) => {
                if (!company) {
                    throw new Error(`لا يوجد حساب شركة لهذا الـ id: ${val}`);
                }
            })
        ),
    check("comment")
        .notEmpty().withMessage("يجب كتابة تعليق.")
        .trim().withMessage("لا يمكن أن يكون التعليق فارغًا. يرجى إدخال تعليق قبل الإرسال"),

    validationMiddiel
];

exports.create_Categorey_V = [
    check("name")
        .notEmpty().withMessage("أدخل اسم التصنيف"),

    check("Categoreyimage")
        .notEmpty().withMessage("أدخل صورة التصنيف"),

    check("description")
        .notEmpty().withMessage("أدخل وصف التصنيف"),

    validationMiddiel
];

exports.update_Categorey_V = [
    check("name")
        .notEmpty().withMessage("أدخل اسم التصنيف"),

    check("description")
        .notEmpty().withMessage("أدخل وصف التصنيف"),

    validationMiddiel
];

exports.delete_Categorey_V = [
    check("id")
        .isMongoId().withMessage("هناك خطأ في الـ id")
        .custom((val) =>
            Categoreymodel.findById(val).then((Categorey) => {
                if (!Categorey) {
                    throw new Error(`لا يوجد تصنيف لهذا الـ id: ${val}`);
                }
            })
        ),

    validationMiddiel
];

exports.get_Categorey_company_V = [
    check("id")
        .isMongoId().withMessage("هناك خطأ في الـ id"),

    validationMiddiel
];

exports.create_Company_requests_V = [
    check("name")
        .notEmpty().withMessage("أدخل اسم شركتك"),

    check("description")
        .notEmpty().withMessage("أدخل وصفًا لشركتك.")
        .isLength({ min: 15 }).withMessage("وصف الشركة قصير."),

    check("companyImage")
        .notEmpty().withMessage("أدخل صورة لشركتك."),

    check("logoImage")
        .notEmpty().withMessage("أدخل شعار شركتك"),

    check("phone")
        .optional()
        .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA", "ar-SA", "ar-QA", "ar-KW", "ar-OM", "ar-JO", "ar-LB", "ar-DJ", "ar-MR", "ar-PS", "ar-TN", "ar-YE", "ar-IQ", "ar-SD", "ar-LY"])
        .withMessage("رقم الهاتف غير صالح. يجب أن يكون رقم هاتف عربي صالح."),

    check("linkedIn")
        .optional()
        .custom(value => {
            if (value && !isValidLinkedInURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط LinkedIn صالح.");
            }
            return true;
        }),

    check("facebook")
        .optional()
        .custom(value => {
            if (value && !isValidFacebookURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط Facebook صالح.");
            }
            return true;
        }),

    check("instagram")
        .optional()
        .custom(value => {
            if (value && !isValidInstagramURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط Instagram صالح.");
            }
            return true;
        }),

    check("email")
        .optional()
        .isEmail().withMessage("البريد الإلكتروني غير صالح"),

    check("categorey")
        .notEmpty().withMessage("أدخل تصنيفًا لشركتك")
        .isMongoId().withMessage("خطأ في الـ id")
        .custom((val) =>
            Categoreymodel.findById(val).then((Categorey) => {
                if (!Categorey) {
                    throw new Error(`لا يوجد تصنيف لهذا الـ id: ${val}`);
                }
            })
        ),

    check("subscription")
        .notEmpty().withMessage("حدد نوع الاشتراك")
        .isIn(["سنوي", "ثلاث شهور", "شهري"]).withMessage("نوع الاشتراك غير صالح"),

    check("Country")
        .notEmpty().withMessage("أدخل دولتك"),

    validationMiddiel
];

exports.update_Company_requests_V = [
    check("description")
        .optional()
        .isLength({ min: 15 }).withMessage("وصف الشركة قصير.")
        .custom((val, { req }) => {
            if (req.type === 'basic plan' && val.length > 150) {
                throw new Error('الوصف يجب أن يكون أقل من 150 حرفًا للـ plan الأساسي.');
            }
            if (req.type === 'advanced plan' && val.length > 300) {
                throw new Error('الوصف يجب أن يكون أقل من 300 حرفًا للـ plan المتقدم.');
            }
            return true;
        }),

    check("phone")
        .optional()
        .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA", "ar-SA", "ar-QA", "ar-KW", "ar-OM", "ar-JO", "ar-LB", "ar-DJ", "ar-MR", "ar-PS", "ar-TN", "ar-YE", "ar-IQ", "ar-SD", "ar-LY"])
        .withMessage("رقم الهاتف غير صالح. يجب أن يكون رقم هاتف عربي صالح."),

    check("linkedIn")
        .optional()
        .custom(value => {
            if (value && !isValidLinkedInURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط LinkedIn صالح.");
            }
            return true;
        }),

    check("facebook")
        .optional()
        .custom(value => {
            if (value && !isValidFacebookURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط Facebook صالح.");
            }
            return true;
        }),

    check("instagram")
        .optional()
        .custom(value => {
            if (value && !isValidInstagramURL(value)) {
                throw new Error("الرابط يجب أن يكون رابط Instagram صالح.");
            }
            return true;
        }),

    check("email")
        .optional()
        .isEmail().withMessage("البريد الإلكتروني غير صالح"),

    check("categorey")
        .optional()
        .isMongoId().withMessage("خطأ في الـ id")
        .custom((val) =>
            Categoreymodel.findById(val).then((Categorey) => {
                if (!Categorey) {
                    throw new Error(`لا يوجد تصنيف لهذا الـ id: ${val}`);
                }
            })
        ),

    validationMiddiel
];

exports.get_Company_requests_id_V = [
    check("id")
        .isMongoId().withMessage("هناك خطأ في الـ id")
        .custom((val) =>
            Company_requestsmodel.findById(val).then((Company) => {
                if (!Company) {
                    throw new Error(`لا يوجد طلب لشركة لهذا الـ id: ${val}`);
                }
            })
        ),

    validationMiddiel
];

exports.delete_Company_requests_V = [
    check("id")
        .isMongoId().withMessage("هناك خطأ في الـ id")
        .custom((val, { req }) =>
            Company_requestsmodel.findById(val).then((Company) => {
                if (!Company) {
                    throw new Error(`لا يوجد طلب لشركة لهذا الـ id: ${val}`);
                }
                if (Company.user.toString() !== req.user._id.toString()) {
                    throw new Error(`هذا الطلب ليس لك.`);
                }
            })
        ),

    validationMiddiel
];

exports.Accept_Company_requests_admin_V = [
    check("id")
        .isMongoId().withMessage("هناك خطأ في الـ id")
        .custom((val) =>
            Company_requestsmodel.findById(val).then((Company) => {
                if (!Company) {
                    throw new Error(`لا يوجد طلب لشركة لهذا الـ id: ${val}`);
                }
            })
        ),

    validationMiddiel
];

exports.delete_Company_requests_admin_V = [
    check("id")
        .isMongoId().withMessage("هناك خطأ في الـ id")
        .custom((val) =>
            Company_requestsmodel.findById(val).then((Company) => {
                if (!Company) {
                    throw new Error(`لا يوجد طلب لشركة لهذا الـ id: ${val}`);
                }
            })
        ),

    validationMiddiel
];

