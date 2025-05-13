const usermodel = require("../models/userModels")
const ApiError = require("../ApiError");

const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");

const multer = require("multer")
const sharp = require('sharp');
const {v4 : uuidv4} = require("uuid")


// 2- memoryStorage

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb)=>{
    if(file.mimetype.startsWith("image")){
        cb(null, true)
    }else{
        cb(new ApiError("not img" , 400), false)
    }
}

const upload = multer({storage : multerStorage , fileFilter: multerFilter})

exports.imguser = upload.fields([
    { name: "Cover_image", maxCount: 1 }, // صورة واحدة فقط
    { name: "profilImage", maxCount: 1 }, // صورة واحدة فقط
  ]);

exports.resizeImg =asyncHandler( async (req, res, next)=>{
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
    if (req.files && req.files.profilImage) {
      await sharp(req.files.profilImage[0].buffer) // استخدم `req.files.profilImage[0]`
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`image/user/${filename}`);
  
      req.body.profilImage = filename;
    }
  
    next();
})

exports.resizeCover_images = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.files && req.files.Cover_image) {
    await sharp(req.files.Cover_image[0].buffer) // استخدم `req.files.Cover_images[0]`
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`image/user/${filename}`);

    req.body.Cover_image = filename;
  }

  next();
});


exports.get_users = asyncHandler(async (req, res) => {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    const name = req.query.name || ''; // إضافة استعلام `name` للبحث

    const query = name ? { name: { $regex: name, $options: 'i' } } : {}; // تحديد شرط البحث

    const Alluser = await usermodel.countDocuments();

    const users = await usermodel.find(query).skip(skip).limit(limit);

    res.status(200).json({ count: users.length, Alluser : Alluser, page, data: users });
});

// -------------------------------------------------
exports.get_user_ID = asyncHandler(  async (req,res,next)=>{    
    const {id} = req.params
    const user = await usermodel.findById(id)
    if(!user){
        return next(new ApiError(`there is no user id ${id}` , 404))
    }
    res.status(200).json({data:user})
})

// ----------------------------------------------
exports.create_user = asyncHandler( async (req,res)=>{
    req.body.slug = slugify(req.body.name)

    const user = await usermodel.create({
        name : req.body.name,
        slug : req.body.slug ,
        email : req.body.email,
        password : await bcrypt.hash(req.body.password, 12),
        phone : req.body.phone,
        profilImage :req.body.profilImage,
        role : req.body.role
    })

    const token = jsonwebtoken.sign(
        {userID : user._id},
        process.env.WJT_SECRET,
        {expiresIn: process.env.WJT_EXPIRESIN}
    )

    res.status(201).json({data : user, token})

})

//----------------------------------------
exports.update_user = asyncHandler( async (req,res,next)=>{
    if(req.body.name){
        req.body.slug = slugify(req.body.name)
    }
    

    const user = await usermodel.findOneAndUpdate(
        {_id : req.user._id},
        {
            name : req.body.name,
            slug : req.body.slug,
            phone : req.body.phone,
            profilImage : req.body.profilImage,
            Cover_image : req.body.Cover_image,
            description : req.body.description,
            address : req.body.address
        },
        {new: true}
        
    )
    
    if(!user){
        return next(new ApiError(`there is no user id ${id}` , 404))
    }
    res.status(200).json({data:user})
})

// -----------------------------------------
exports.delete_user = asyncHandler( async (req,res,next)=>{
    const {id} = req.params

    const user = await usermodel.findByIdAndDelete(id)
    if(!user){
        return next(new ApiError(`there is no user id ${id}` , 404))
    }
    res.status(204).send()
})

// ------------------------------------------------------
exports.update_password_user = asyncHandler( async (req,res,next)=>{
    const {id} = req.params

    const user = await usermodel.findOneAndUpdate(
        {_id : id},
        {
            password : await bcrypt.hash(req.body.password, 12),
            password_Update_Time : Date.now()
        },
        {new: true}
    )
    if(!user){
        return next(new ApiError(`there is no user id ${id}` , 404))
    }

    const token = jsonwebtoken.sign(
        {userID : user._id},
        process.env.WJT_SECRET,
        {expiresIn: process.env.WJT_EXPIRESIN}
    )

    res.status(200).json({data:user , token})
})

// ----------------------------------------------------




