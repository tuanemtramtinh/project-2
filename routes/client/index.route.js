const chatRoute = require("../../routes/client/chat.route");
const userRoute = require("../../routes/client/user.route");
const userMiddleware = require("../../middlewares/user.middleware");

module.exports = (app) => {
  app.use("/chat", userMiddleware.requireAuth, chatRoute);

  app.use("/user", userRoute);
};
