const ChatModel = require("../models/chat.model");
const UserModel = require("../models/user.model");
const uploadHelper = require("../helpers/uploadHelper");

module.exports.index = async (req, res) => {
  try {
    const roomChatId = req.params.roomChatId;

    _io.once("connection", (socket) => {
      socket.join(roomChatId);

      console.log("Có 1 user được kết nối", socket.id);

      socket.on("CLIENT_SEND_MESSAGE", async (data) => {
        // console.log(data.images);

        // console.log(await uploadHelper(data.images[0]));

        const images = [];

        for (const image of data.images) {
          const imageUrl = (await uploadHelper(image)).url;
          images.push(imageUrl);
        }

        const dataChat = {
          userId: res.locals.user.id,
          roomChatId: roomChatId,
          content: data.content,
          images: images,
        };

        await ChatModel.create(dataChat);

        _io.to(roomChatId).emit("SERVER_RETURN_MESSAGE", {
          userId: res.locals.user.id,
          fullName: res.locals.user.fullName,
          content: data.content,
          images: images,
        });
      });

      socket.on("CLIENT_SEND_TYPING", (type) => {
        socket.broadcast.to(roomChatId).emit("SERVER_RETURN_TYPING", {
          userId: res.locals.user.id,
          fullName: res.locals.user.fullName,
          type: type,
        });
      });
    });

    const chats = await ChatModel.find({
      roomChatId: roomChatId,
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
