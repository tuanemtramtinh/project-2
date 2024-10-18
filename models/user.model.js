const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  token: String,
  phone: String,
  avatar: String,
  status: {
    type: String,
    default: "active",
  },
  deleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
