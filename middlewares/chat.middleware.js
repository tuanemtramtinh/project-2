const RoomChatModel = require("../models/rooms-chat.model");

module.exports.isAccess = async (req, res, next) => {
  try {
    const roomChatId = req.params.roomChatId;
    const user = res.locals.user;

    const roomChat = await RoomChatModel.findOne({
      _id: roomChatId,
    });

    if (!roomChat) {
      res.redirect("/");
      return;
    }

    const existUserInRoomChat = roomChat.users.find(
      (item) => item.userId === user.id
    );
    
    if (!existUserInRoomChat) {
      res.redirect("/");
      return;
    }

    next();
  } catch (error) {
    console.log(error);
  }
};
