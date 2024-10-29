const mongoose = require("mongoose");

const roomChatSchema = new mongoose.Schema(
  {
    title: String,
    typeRoom: String,
    users: Array,
    // avatar: String,
    // background: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const RoomChatModel = mongoose.model("RoomChat", roomChatSchema, "rooms-chat");

module.exports = RoomChatModel;
