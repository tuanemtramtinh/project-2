const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const path = require("path");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const routeClient = require("./routes/client/index.route");
const databaseConfig = require("./config/database");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

global._io = io;

databaseConfig.connect();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser("tuanemtramtinh"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());

routeClient(app);

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
