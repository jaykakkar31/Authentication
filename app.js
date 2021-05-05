//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption"); //1
const app = express();
const md5 = require("md5"); //2

const bcrypt = require("bcrypt");
const saltRounds = 10;

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

// For ejs all ejs gonalook inside the view folder
app.set("view engine", "ejs");
const port = 3000;

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/usersDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// console.log(process.env.SECRET);

// var secret = "Tisisoursecret";
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/logout",function(req,res){
  req.logout()
  res.redirect("/")
})

app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {

    const user=new User({
      username:req.body.username,
      password:req.body.password
    })

    req.login(user,function(err){
      if(err){
        console.log(err);
      }
      else{
         passport.authenticate("local")(req, res, function () {
           res.redirect("/secrets");
         });
      }
    })

    // const email = req.body.email;
    // // const password = md5(req.body.password);
    // const password = req.body.password;
    // User.findOne({ email: email }, function (err, foundUser) {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     if (foundUser !== null) {
    //       //   if (foundUser.password === password) {
    //       //     res.render("secrets");
    //       //   }
    //       bcrypt.compare(password, foundUser.password, function (err, result) {
    //         if(result===true){
    //             res.render("secrets")
    //         }
    //       });
    //     }
    //   }
    // });
  });

app.route("/register").get(function (req, res) {
  res.render("register");
});

app.get("/secrets", function (req, res) {
  // console.log('*******', req)
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});
//   .post(function (req, res) {

// bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
//   const user = new User({
//     email: req.body.email,
//     // password: md5(req.body.password),
//     password: hash,
//   });
//   user.save(function (err) {
//     if (!err) {
//       console.log("Successfully inserted");
//       res.render("secrets");
//     } else {
//       console.log(err);
//     }
//   });
// });
//   });

app.post("/register", function (req, res) {
  //value name is used username otherwise problem
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });
       
  
});

app.listen(port, function () {
  console.log(`server responds at http://localhost:${port}`);
});
