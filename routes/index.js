var express = require("express");
var router = express.Router();
const userModel = require("./users");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");
const postModel = require("./post");

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res, next) {
  res.render("index", { nav: false });
});

router.get("/register", function (req, res, next) {
  res.render("register", { nav: false });
});

router.get("/profile", isLoogedIn, async function (req, res, next) {
  const user = 
  await userModel
  .findOne({ username: req.session.passport.user })
  .populate("posts")
  res.render("profile", { user, nav: true });
});

//Show all posts
router.get("/show/posts", isLoogedIn, async function (req, res, next) {
  const user = 
  await userModel
  .findOne({ username: req.session.passport.user })
  .populate("posts")
  res.render("show", { user, nav: true });
});

//Show all feeds:-
router.get("/feed", isLoogedIn, async function (req, res, next) {
  const user = 
  await userModel.findOne({ username: req.session.passport.user })
  const posts = await postModel.find()
  .populate("user")

  res.render("feed", {user, posts, nav: true});
});

//Add a new post
router.get("/add", isLoogedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("add", { user, nav: true });
});

//Create posts
router.post(
  "/createpost",
  upload.single("postimage"),
  isLoogedIn,
  async function (req, res, next) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const post = await postModel.create({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      // image: req.file.postimage,
      image: req.file.filename,
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  }
);

router.post("/register", function (req, res, next) {
  const data = new userModel({
    username: req.body.username,
    name: req.body.fullname,
    email: req.body.email,
    contact: req.body.contact,
  });
  userModel.register(data, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
  }),
  function (req, res, next) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoogedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

//image uploads Routs:-
router.post(
  "/fileupload",
  isLoogedIn,
  upload.single("image"),
  async function (req, res, next) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

module.exports = router;

// var express = require("express");
// var router = express.Router();

// //My code by shriyean Coding school:-
// const userModel = require("./users");
// const passport = require("passport");

// //add these two lines at top
// const localStrategy = require("passport-local");
// passport.use(new localStrategy(userModel.authenticate()));

// /* GET home page. */
// router.get("/", function (req, res) {
//   res.render("index");
// });

// router.get("/register", function (req, res, next) {
//   res.render("register");
// });

// //Profile Routh:- by me

// router.get("/profile", isLoggedIn, function (req, res) {
//   res.render("profile");
// });

// //Regester route:-
// router.post("/register", function (req, res) {
//   var userdata = new userModel({
//     username: req.body.username,
//     secret: req.body.secret,
//   });
//   userModel
//     .register(userdata, req.body.passport)
//     .then(function (registereduser) {
//       passport.authenticate("local")(req, res, function () {
//         res.redirect("/profile");
//       });
//     });
// });

// //Code for Log In
// router.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/profile",
//     failureRedirect: "/",
//   }),
//   function (req, res) {}
// );

// //Logout page my me:- im 1.png shriyeans notes
// router.get("/logout", function (req, res, next) {
//   req.logout(function (err) {
//     if (err) {
//       return next(err);
//     }
//     res.redirect("/");
//   });
// });

// //Code for isLoggedIn middleWere  page my me:- im 1.png shriyeans notes:-

// function isLoggedIn(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect("/");
// }

// module.exports = router;
