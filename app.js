//jshint esversion:6

require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

// For ejs all ejs gonalook inside the view folder
app.set("view engine", "ejs");
const port = 3000;

mongoose.connect("mongodb://localhost:27017/usersDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

console.log(process.env.SECRET);

var secret = "Tisisoursecret";
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const newUser = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    newUser.findOne({ email: email }, function (err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser !== null) {
          if (foundUser.password === password) {
            
            res.render("secrets");
          }
        }
      }
    });
  });

app
  .route("/register")
  .get(function (req, res) {
    res.render("register");
  })
  .post(function (req, res) {
    const user = new newUser({
      email: req.body.email,
      password: req.body.password,
    });
    user.save(function (err) {
      if (!err) {
        console.log("Successfully inserted");
        res.render("secrets");
      } else {
        console.log(err);
      }
    });
  });

app.listen(port, function () {
  console.log(`server responds at http://localhost:${port}`);
});
