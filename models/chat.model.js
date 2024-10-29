const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema(
  {
    userId: String,
    roomChatId: String,
    content: String,
    images: Array,
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
const ChatModel = mongoose.model("chat", chatSchema, "chats");
module.exports = ChatModel;