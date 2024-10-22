const ChatModel = require("../models/chat.model");
const UserModel = require("../models/user.model");

module.exports.index = async (req, res) => {
  try {
    _io.once("connection", (socket) => {
      console.log("Có 1 user được kết nối", socket.id);

      socket.on("CLIENT_SEND_MESSAGE", async (data) => {

        console.log(data.images);
        const dataChat = {
          userId: res.locals.user.id,
          content: data.content,
        };

        await ChatModel.create(dataChat);

        _io.emit("SERVER_RETURN_MESSAGE", {
          userId: res.locals.user.id,
          fullName: res.locals.user.fullName,
          content: data.content,
        });
      });

      socket.on("CLIENT_SEND_TYPING", (type) => {
        socket.broadcast.emit("SERVER_RETURN_TYPING", {
          userId: res.locals.user.id,
          fullName: res.locals.user.fullName,
          type: type,
        });
      });
    });

    
    const chats = await ChatModel.find({
      deleted: false,
    });

    for (const chat of chats) {
      const infoUser = await UserModel.findOne({
        _id: chat.userId,
      });
      chat.fullName = infoUser.fullName;
    }

    res.render("client/pages/chat/index", {
      pageTitle: "Trang Chat",
      chats: chats,
    });
  } catch (error) {
    console.log(error);
  }
};
