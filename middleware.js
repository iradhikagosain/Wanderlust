const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review");

module.exports.isLoggedIn = (req,res,next)=>
{
    
    if(!req.isAuthenticated()){
        req.session.redirectUrl= req.originalUrl;
        req.flash("error","you must be logged in to create or delete listing!");
          return res.redirect("/login");
      }
      next();
}

module.exports.saveRedirectUrl=(req,res,next)=>
{
    if(req.session.redirectUrl)
    {
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner= async(req,res,next)=>
{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the owner of this listing!");
      return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
  let result = listingSchema.validate(req.body);
  console.log(result);
  if (result.error) {
    throw new ExpressError(400, result.error);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
    let result = reviewSchema.validate(req.body);
    console.log(result);
    if (result.error) {
      throw new ExpressError(400, result.error);
    } else {
      next();
    }
  };
  

  module.exports.isreviewAuthor= async(req,res,next)=>
    {
        let { id, reviewId} = req.params;
        let review = await Review.findById(reviewId);
        if (!review.author.equals(res.locals.currUser._id)) {
          req.flash("error", "You are not the author of this review!");
          return res.redirect(`/listings/${id}`);
        }
        next();
    }