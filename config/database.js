const mongoose = require("mongoose");
require("dotenv").config();

module.exports.connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      authSource: "admin",
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASS,
    });

    console.log("Kết nối database thành công");
  } catch (error) {
    console.log("Kết nối database không thành công");
    console.log(error);
  }
};
