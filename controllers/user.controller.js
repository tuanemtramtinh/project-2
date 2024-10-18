const crypto = require("crypto");
const UserModel = require("../models/user.model");
const md5 = require("md5");

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

    console.log(existUser);

    res.cookie("tokenUser", existUser.token);
    req.flash("success", "Đăng nhập thành công");

    res.redirect("/chat");
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

    res.redirect("/chat");
  } catch (error) {
    console.log(error);
  }
};

module.exports.logout = (req, res) => {
  try {
    res.clearCookie("tokenUser");
    res.redirect("/user/login");
  } catch (error) {
    console.log(error);
  }
};
