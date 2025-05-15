const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

// LISTING SCHEMA
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: { 
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    }
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  }
});

// Middleware to delete reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing && listing.reviews && listing.reviews.length > 0) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
