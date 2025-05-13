const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// تعريف المخطط الخاص بالمستخدم
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "الاسم مطلوب"], // تحسين صيغة الرسالة
    },

    slug: {
        type: String,
        lowercase: true,
    },

    profilImage: String,

    email: {
        type: String,
        required: [true, "البريد الإلكتروني مطلوب"],
        lowercase: true,
    },

    phone: String,

    password: {
        type: String,
        required: [true, "كلمة المرور مطلوبة"],
        minlength: [5, "كلمة المرور يجب أن تكون على الأقل 5 أحرف"]
    },

    password_Update_Time: Date,

    passwoedResetCode: String,

    passwoedResetCodeDate: Date,

    passwoedResetCodeVerified: Boolean,
    googleId: { type: String },
    role: {
        type: String,
        enum: ["user", "admin", "employee"],
        default: "user",
    },
    thread_id: [{
        id_thread: {
            type: String
        }
    }],

    active: {
        type: Boolean,
        default: true,
    },

    points: {
        type: Number,
        default: 20,
    },

    friends: [{
        friend: {
            type: mongoose.Schema.ObjectId,
            ref: "user"
        }
    }],

    Friend_requests: [{
        friend: {
            type: mongoose.Schema.ObjectId,
            ref: "user"
        }
    }],

    verificationCode: {
        type: Number
    },

    // خاصية لحفظ المنشورات
    savedPosts: [{
        post: {
            type: mongoose.Schema.ObjectId,
            refPath: "savedPosts.postModel"
        },
        postModel: {
            type: String,
            enum: ["post_1", "post_2", "post_3", "post_4", "post", "post_6"] // أنواع المنشورات المدعومة
        }
    }],


    address: String,
    description: String,
    Cover_image: String,

    // تتبع محاولات حل منشورات من النوع 2
    solvedPost_2: [
        {
            postId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "post_2",
            },
            result: [
                {
                    questionId: mongoose.Schema.Types.ObjectId,
                    yourAnswer: String,
                    correctAnswer: String,
                    isCorrect: Boolean
                }
            ],
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    // تتبع محاولات حل منشورات من النوع 3
    solvedPost_3: [
        {
            postId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "post_3"
            },
            result: [
                {
                    questionId: mongoose.Schema.Types.ObjectId,
                    yourAnswer: Boolean,
                    correctAnswer: Boolean,
                    isCorrect: Boolean
                }
            ],
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    // تتبع محاولات حل منشورات من النوع 4
    solvedPost_4: [
        {
            postId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "post_4"
            },
            result: [
                {
                    questionId: mongoose.Schema.Types.ObjectId,
                    yourAnswer: String,
                    correctAnswer: String,
                    isCorrect: Boolean
                }
            ],
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

}, { timestamps: true });

// تعريف النموذج
const usermodel = mongoose.model("user", userSchema);

module.exports = usermodel;