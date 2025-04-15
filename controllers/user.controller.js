const crypto = require("crypto");
const UserModel = require("../models/user.model");
const md5 = require("md5");
const userSocket = require("../sockets/user.socket");
const RoomChatModel = require("../models/rooms-chat.model");

module.exports.login = (req, res) => {
  try {
    res.render("client/pages/user/login", {
      pageTitle: "Trang đăng nhập",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.loginPost = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const existUser = await UserModel.findOne({
      email: email,
      deleted: false,
    });

    if (!existUser) {
      req.flash("error", "Tài khoản không tồn tại");
      res.redirect("back");
      return;
    }

    if (existUser.password !== md5(password)) {
      req.flash("error", "Sai mật khẩu");
      res.redirect("back");
      return;
    }

    if (existUser.status === "inactive") {
      req.flash("error", "Tài khoản bị khoá");
      res.redirect("back");
      return;
    }

    res.cookie("tokenUser", existUser.token);

    _io.once("connection", (socket) => [
      _io.emit("SERVER_RETURN_STATUS_ONLINE_USER", {
        userId: existUser.id,
        statusOnline: "online",
      }),
    ]);

    await UserModel.updateOne(
      {
        email: email,
      },
      {
        statusOnline: "online",
      }
    );

    req.flash("success", "Đăng nhập thành công");

    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

module.exports.register = (req, res) => {
  try {
    res.render("client/pages/user/register", {
      pageTitle: "Trang đăng ký",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.registerPost = async (req, res) => {
  try {
    const token = crypto.randomBytes(20).toString("hex");

    await UserModel.create({
      fullName: req.body.fullName,
      email: req.body.email,
      password: md5(req.body.password),
      token: token,
    });

    res.cookie("tokenUser", token);

    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

module.exports.logout = async (req, res) => {
  try {
    const tokenUser = req.cookies.tokenUser;

    _io.once("connection", (socket) => {
      _io.emit("SERVER_RETURN_STATUS_ONLINE_USER", {
        userId: res.locals.user.id,
        statusOnline: "offline",
      });
    });

    await UserModel.updateOne(
      {
        token: tokenUser,
      },
      {
        statusOnline: "offline",
      }
    );

    res.clearCookie("tokenUser");
    res.redirect("/user/login");
  } catch (error) {
    console.log(error);
  }
};

module.exports.notFriend = async (req, res) => {
  try {
    const userIdA = res.locals.user.id;

    userSocket(req, res);

    const friendsList = res.locals.user.friendsList;
    const friendsListId = friendsList.map((item) => item.userId);

    const users = await UserModel.find({
      $and: [
        { _id: { $ne: userIdA } },
        { _id: { $nin: res.locals.user.requestFriends } },
        { _id: { $nin: res.locals.user.acceptFriends } },
        { _id: { $nin: friendsListId } },
      ],
      deleted: false,
      status: "active",
    }).select("id fullName avatar");

    res.render("client/pages/user/not-friend", {
      pageTitle: "Danh sách người dùng",
      users: users,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.request = async (req, res) => {
  try {
    const userIdA = res.locals.user.id;

    userSocket(req, res);

    const users = await UserModel.find({
      _id: { $in: res.locals.user.requestFriends },
      deleted: false,
      status: "active",
    }).select("id fullName avatar");

    res.render("client/pages/user/request", {
      pageTitle: "Lời mời đã gửi",
      users: users,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.accept = async (req, res) => {
  try {
    const userA = res.locals.user;

    userSocket(req, res);

    const users = await UserModel.find({
      _id: { $in: userA.acceptFriends },
      deleted: false,
      status: "active",
    }).select("id fullName avatar");

    res.render("client/pages/user/accept", {
      pageTitle: "Lời mời đã nhận",
      users: users,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.friends = async (req, res) => {
  try {
    const friendsList = res.locals.user.friendsList;
    const users = [];

    for (const user of friendsList) {
      const infoUser = await UserModel.findOne({
        _id: user.userId,
        deleted: false,
        status: "active",
      });

      users.push({
        id: infoUser.id,
        fullName: infoUser.fullName,
        avatar: infoUser.avatar,
        statusOnline: infoUser.statusOnline,
        roomChatId: user.roomChatId,
      });
    }

    res.render("client/pages/user/friends", {
      pageTitle: "Danh sách bạn bè",
      users: users,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.rooms = async (req, res) => {
  try {
    const roomChat = await RoomChatModel.find({
      "users.userId": res.locals.user.id,
      typeRoom: "group",
      deleted: false,
    });

    res.render("client/pages/user/rooms", {
      pageTitle: "Danh sách phòng chat",
      rooms: roomChat,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.createRoom = async (req, res) => {
  try {
    const friendsList = res.locals.user.friendsList;

    const friends = [];

    for (const friend of friendsList) {
      const infoFriend = await UserModel.findOne({
        _id: friend.userId,
        status: "active",
        deleted: false,
      });

      friends.push({
        userId: friend.userId,
        fullName: infoFriend.fullName,
      });
    }

    res.render("client/pages/user/create-room", {
      pageTitle: "Tạo phòng chat",
      friendsList: friends,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.createRoomPost = async (req, res) => {
  try {
    const roomTitle = req.body.title;

    const usersId = req.body.usersId;

    const participants = [];

    participants.push({
      userId: res.locals.user.id,
      role: "superAdmin",
    });

    for (const userId of usersId) {
      participants.push({
        userId: userId,
        role: "user",
      });
    }

    const newRoomChat = new RoomChatModel({
      title: roomTitle,
      typeRoom: "group",
      users: participants,
    });

    await newRoomChat.save();

    req.flash("success", "Tạo phòng chat thành công");
    res.redirect(`/chat/${newRoomChat.id}`);
  } catch (error) {
    console.log(error);
  }
};
