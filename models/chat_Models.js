const mongoose = require("mongoose");

const simpleChatSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.ObjectId,
        ref: "user", // المستخدم الأول
        required: true
    },
    user2: {
        type: mongoose.Schema.ObjectId,
        ref: "user", // المستخدم الثاني
        required: true
    },
    messages: [{
        sender: {
            type: mongoose.Schema.ObjectId,
            ref: "user", // المرسل
            required: true
        },
        content: {
            type: String, // محتوى الرسالة
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now // وقت إرسال الرسالة
        }
    }],
}, {timestamps: true});

const SimpleChatModel = mongoose.model("SimpleChat", simpleChatSchema);

module.exports = SimpleChatModel;