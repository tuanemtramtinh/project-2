const RoomChatModel = require("../models/rooms-chat.model");
const UserModel = require("../models/user.model");

module.exports = (req, res) => {
  const userIdA = res.locals.user.id;

  _io.once("connection", (socket) => {
    // Khi A gửi kết bạn cho B
    socket.on("CLIENT_ADD_FRIEND", async (userIdB) => {
      // Thêm id của A vào acceptFriends của B
      const existAInB = await UserModel.findOne({
        _id: userIdB,
        acceptFriends: userIdA,
      });

      if (!existAInB) {
        await UserModel.updateOne(
          {
            _id: userIdB,
          },
          {
            $push: { acceptFriends: userIdA },
          }
        );
      }

      //Thêm id B vào requestFriends của A

      const existBinA = await UserModel.findOne({
        _id: userIdA,
        requestFriends: userIdB,
      });

      if (!existBinA) {
        await UserModel.updateOne(
          {
            _id: userIdA,
          },
          {
            $push: { requestFriends: userIdB },
          }
        );
      }

      //Trả về cho B số lượng user cần chấp nhận
      const userB = await UserModel.findOne({
        _id: userIdB,
        deleted: false,
        status: "active",
      });

      _io.emit("SERVER_RETURN_LENGTH_ACCEPT_FRIENDS", {
        userIdB: userIdB,
        length: userB.acceptFriends.length,
      });

      //Trả về cho B thông tin của A
      _io.emit("SERVER_RETURN_INFO_ACCEPT_FRIENDS", {
        userIdA: userIdA,
        fullNameA: res.locals.user.fullName,
        avatarA: "",
        userIdB: userIdB,
      });
    });

    //Khi A huỷ yêu cầu kết bạn cho B
    socket.on("CLIENT_CANCEL_FRIEND", async (userIdB) => {
      //Xoá id của A ở acceptFriends của B
      const existAInB = await UserModel.findOne({
        _id: userIdB,
        acceptFriends: userIdA,
      });

      if (existAInB) {
        await UserModel.updateOne(
          {
            _id: userIdB,
          },
          {
            $pull: { acceptFriends: userIdA },
          }
        );
      }

      //Xoá id của B ở requestFriends của A

      const existBInA = await UserModel.findOne({
        _id: userIdA,
        requestFriends: userIdB,
      });

      if (existBInA) {
        await UserModel.updateOne(
          {
            _id: userIdA,
          },
          {
            $pull: { requestFriends: userIdB },
          }
        );
      }

      // Trả về cho B số lượng user cần chấp nhận
      const userB = await UserModel.findOne({
        _id: userIdB,
        deleted: false,
        status: "active",
      });
      _io.emit("SERVER_RETURN_LENGTH_ACCEPT_FRIENDS", {
        userIdB: userIdB,
        length: userB.acceptFriends.length,
      });

      //Trả về cho B thông tin của A để xoá A khỏi giao diện
      _io.emit("SERVER_RETURN_INFO_CANCEL_FRIENDS", {
        userIdA: userIdA,
        userIdB: userIdB,
      });
    });

    //Khi A từ chối kết bạn của B
    socket.on("CLIENT_REFUSE_FRIEND", async (userIdB) => {
      //Xoá id của B trong acceptFriends của A
      const existBInA = await UserModel.findOne({
        _id: userIdA,
        acceptFriends: userIdB,
      });

      if (existBInA) {
        await UserModel.updateOne(
          {
            _id: userIdA,
          },
          {
            $pull: { acceptFriends: userIdB },
          }
        );
      }

      //Xoá id của A trong requestFriends của B
      const existAInB = await UserModel.findOne({
        _id: userIdB,
        requestFriends: userIdA,
      });

      if (existAInB) {
        await UserModel.updateOne(
          {
            _id: userIdB,
          },
          {
            $pull: { requestFriends: userIdA },
          }
        );
      }
    });

    //Khi A chấp nhận kết bạn của B
    socket.once("CLIENT_ACCEPT_FRIEND", async (userIdB) => {
      const existBInA = await UserModel.findOne({
        _id: userIdA,
        acceptFriends: userIdB,
      });

      const existAInB = await UserModel.findOne({
        _id: userIdB,
        requestFriends: userIdA,
      });

      if (existBInA && existAInB) {
        const roomChat = new RoomChatModel({
          typeRoom: "friend",
          users: [
            {
              userId: userIdA,
              role: "superAdmin",
            },
            {
              userId: userIdB,
              role: "superAdmin",
            },
          ],
        });

        await roomChat.save();

        // Thêm {userId, roomChatId} của B vào friendsList của A
        // Xóa id của B trong acceptFriends của A
        await UserModel.updateOne(
          {
            _id: userIdA,
          },
          {
            $pull: { acceptFriends: userIdB },
            $push: {
              friendsList: {
                userId: userIdB,
                roomChatId: roomChat.id,
              },
            },
          }
        );

        // Thêm {userId, roomChatId} của A vào friendsList của B
        // Xóa id của A trong requestFriends của B
        await UserModel.updateOne(
          {
            _id: userIdB,
          },
          {
            $pull: { requestFriends: userIdA },
            $push: {
              friendsList: {
                userId: userIdA,
                roomChatId: roomChat.id,
              },
            },
          }
        );
      }
    });
  });
};
