if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

console.log(process.env);

// REQUIRING PACKAGES
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.use((req, res, next) => {
    res.locals.curUser = req.user || null;
    next();
});

// ROUTES
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// DATABASE CONNECTION
const dbUrl = process.env.ATLASDB_URL;
main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

// VIEW ENGINE SETUP
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

//deployy mongo
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("error in mongo session store", err);
});
// SESSION CONFIG
const sessionOptions = {
  store,
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: true, 
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// PASSPORT CONFIG
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// FLASH & CURRENT USER SETUP IN RESPONSE LOCALS
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ROUTES
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// DEBUG ROUTE (OPTIONAL)
app.get("/debug", (req, res) => {
  res.send(req.user || "Not logged in");
});

// 404 HANDLER
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// START SERVER
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});


