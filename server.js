const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const xss = require("xss-clean");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoSanitize = require("express-mongo-sanitize");
const csurf = require("csurf");
const userroutes = require("./routes/userRoutes");
const authroutes = require("./routes/authRoutes");
const post_routes = require("./routes/post_Routes");
const chat_routes = require("./routes/chat_Routes");
const chat_AI_routes = require("./routes/Chat_AiRoutes");
const bcrypt = require('bcryptjs');


const passport = require("passport");
const jwt = require("jsonwebtoken");
const usermodel = require("./models/userModels");
require('./passport');


//------------------------------

// const session = require('express-session');
const MongoStore = require("connect-mongo");

dotenv.config({ path: "config.env" });

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("mongoose yes");
  })
  .catch((err) => {
    console.log("mongoose no");
  });

const app = express();
const allowedOrigins = [
  'http://localhost:3000',
  'https://ss-rr-gg-main-ai.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({
  limit: "10000kb",
  type: 'application/json; charset=utf-8'
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://ss-rr-gg-main-ai.vercel.app");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//   ====================================================================

// 1. بدء تسجيل الدخول
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// 2. الاستجابة من Google
app.get("/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    const { id, displayName, emails, photos } = req.user;
    const hashedPassword = await bcrypt.hash('123456', 10);
    try {
      let user = await usermodel.findOne({ googleId: id });

      if (!user) {
        user = await usermodel.create({
          googleId: id,
          name: displayName,
          email: emails[0].value,
          profilImage: photos[0].value,
          password:hashedPassword,
        });
      } 
      if (user) {
        user.active = true;
        await user.save(); // حفظ التحديث
      }

    const token = jwt.sign(
        { userID: user._id },
        process.env.WJT_SECRET,
        { expiresIn: "90d" }
    );

    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
    } catch (err) {
      console.error(err);
      res.redirect(`${process.env.CLIENT_URL}/signandlog?error=server`);
    }
  }
);



app.get("/api/userinfo", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.WJT_SECRET);
    usermodel.findById(decoded.userID).then(user => {
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ user });
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
});

// ======================================================
// const session = require('express-session');
// const MongoStore = require('connect-mongo');

// تكوين الجلسات
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL // استخدم URI الثابت الخاص بقاعدة البيانات
    }),
    cookie: {
        secure: false, // ضعها على true إذا كنت تستخدم HTTPS
        maxAge: 1000 * 60 * 60 // مدة الجلسة: ساعة واحدة
    }
}));

// تكوين csurf
// const csrfProtection = csurf();
// app.use(csrfProtection);



app.use(express.static(path.join(__dirname, "image")));
app.use(express.static(path.join(__dirname, "videos")));
app.use(express.static(path.join(__dirname, "audio")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// To remove data using these defaults:
app.use(mongoSanitize());

// make sure this comes before any routes
app.use(xss());

// app.use((req, res, next) => {
//     res.locals.csrfToken = req.csrfToken(); // يمكنك استخدام ذلك في قوالب HTML
//     next();
// });

app.use(hpp());

app.use("/api/v2/user", userroutes);
app.use("/api/v2/auth", authroutes); 
app.use("/api/v2/post", post_routes);
app.use("/api/v2/chat", chat_routes);
app.use("/api/v2/chat_AI", chat_AI_routes);

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(process.env.NODE_ENV);
}

app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("port 8000");
});

process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Error: ${err}`);
  server.close(() => {
    console.error(`Shutting down....`);
  });
  process.exit(1);
});
