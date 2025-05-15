const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");  // Renders signup form
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });

    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to WanderLust!!");
      res.redirect("/listings");  // Redirect to listings after signup
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");  // Redirect back to signup if error
  }
};

module.exports.renderloginForm = (req, res) => {
  res.render("users/login.ejs");  // FIX: Render login page, not signup page
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to WanderLust!");
  let redirectUrl = res.locals.redirectUrl || "/listings";  // Redirect to original page
  res.redirect(redirectUrl);  // Redirect user after login
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");  // Redirect to listings after logout
  });
};
