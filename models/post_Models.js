const mongoose = require("mongoose");

const post_Schema = new mongoose.Schema({
    
    user : {
        type : mongoose.Schema.ObjectId,
        ref : "user"
    },

    writing: String,

    img_post: [{ type: String }],

    // ⚡️ تحويل video_post إلى Array لدعم رفع عدة فيديوهات
    video_post: [{ type: String }],


    likes :[{
            type : mongoose.Schema.ObjectId,
            ref : "user"
    }],

    comments : [{
        comment : {type:String},
        user_comment : {
            type : mongoose.Schema.ObjectId,
            ref : "user"
        }
    }],

    type: {
        type: String,
        default: "post_5",
        required: true
    },

},{timestamps: true})


const post_model = mongoose.model("post", post_Schema)

module.exports = post_model