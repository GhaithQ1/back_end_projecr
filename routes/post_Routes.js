const express = require("express");

const {
  uploadImages,
  resizeImages,
  processAudioFile,
  resizeImg_questions,
  resizeImg_post_img,
  resizeVideo_video_post,
  createPost,
  createPost_1,
  createPost_2,
  createPost_3,
  createPost_4,
  createPost_6,
  getAllPosts,
  getUserPosts,
  deletePost,
  create_post_comments,
  toggle_post_like,
  chickPost_3,
  checkPost_2,
  chickPost_4
} = require("../services/post_Servicrs");

const {createPost_1_V ,createPost_2_V, createPost_3_V,createPost_4_V,createPost_6_V,create_post_comments_V ,createPost_V} = require("../validationResulterror/v_post_1")


const { check_login, check_user_role } = require("../services/authServicrs");

const post_routes = express.Router();

post_routes.route("/post")
.post(check_login,check_user_role("employee","admin"),uploadImages,resizeImg_post_img,resizeVideo_video_post ,createPost_V,createPost)

post_routes.route("/post_1")
.post(check_login,check_user_role("employee","admin"),uploadImages,resizeImages,processAudioFile,createPost_1_V,createPost_1)

post_routes.route("/post_2")
.post(check_login,check_user_role("employee","admin"),createPost_2_V,createPost_2)

post_routes.route("/post_2_chick")
.post(check_login,checkPost_2)

post_routes.route("/post_3")
.post(check_login,check_user_role("employee","admin"),createPost_3_V,createPost_3)

post_routes.route("/post_3_chick")
.post(check_login,chickPost_3)

post_routes.route("/post_4")
.post(
  check_login, 
  check_user_role("employee", "admin"), 
  uploadImages,// معالجة الصور باستخدام Multer
  resizeImg_questions,
  createPost_4_V,    // تصغير الصور أو تعديلها // التحقق من الحقول المرسلة (Validation)
  createPost_4  // منطق إنشاء المنشور وإرساله إلى قاعدة البيانات
);
post_routes.route('/post_6').post(
  check_login, check_user_role("employee", "admin"),createPost_6_V,createPost_6)

post_routes.route("/post_4_chick")
.post(check_login,chickPost_4)

post_routes.route("")
.get(check_login,getAllPosts)

post_routes.route("/getUserPosts/:userId")
.get(check_login,getUserPosts)

post_routes.route("/:id")
.delete(check_login,check_user_role("employee","admin"),deletePost)

post_routes.route("/create_post_comments/:id")
.post(check_login,create_post_comments_V,create_post_comments)

post_routes.route("/toggle_post_like/:id")
.post(check_login,toggle_post_like)


module.exports = post_routes;
