const Listing = require("../models/listing"); // <-- REQUIRED
const { listingSchema } = require("../schema.js"); // If you're using Joi
const ExpressError = require("../utils/ExpressError"); // If using custom error


// GET: Show all listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

// GET: Render form to create new listing
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// GET: Show a single listing
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

// POST: Create a new listing
module.exports.createListing = async (req, res, next) => {
  try {
    const { error } = listingSchema.validate(req.body);
    if (error) {
      throw new ExpressError(400, error.details.map(el => el.message).join(", "));
    }

    const listing = new Listing(req.body.listing);
    listing.owner = req.user._id;

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    await listing.save();
    req.flash("success", "New listing created!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    next(err);
  }
};

// GET: Render edit form
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
  res.render("listings/edit", { listing,originalImageUrl });
};

// PUT: Update listing
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const updatedListing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });

  if(typeof req.file !== "undefined") {
    
      url=req.file.path;
      filename= req.file.filename;
      updatedListing.image={url,filename};
    await updatedListing.save();
  }

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

// DELETE: Delete listing
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};
