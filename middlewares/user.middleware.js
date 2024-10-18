const UserModel = require("../models/user.model");

module.exports.requireAuth = async (req, res, next) => {
  try {
    if (!req.cookies.tokenUser) {
      res.redirect("/user/login");
      return;
    } else {
      const token = req.cookies.tokenUser;
      // console.log(token);
      const existUser = await UserModel.findOne({
        token: token,
        deleted: false,
      });

      if (!existUser) {
        res.redirect("/user/login");
        return;
      }

      res.locals.user = existUser;

      next();
    }
  } catch (error) {
    console.log(error);
  }
};
