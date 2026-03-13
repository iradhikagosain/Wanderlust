const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// CONNECTING TO DATABASE
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("connected to DB");
  await initDB(); 
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6810ad37d232423a1dbf00c2",
  }));
  await Listing.insertMany(initData.data);
  console.log("data initialized");
};

main().catch((err) => {
  console.log(err);
});
