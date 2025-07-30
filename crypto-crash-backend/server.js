const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const{ socketHandler} = require("./websocket/socketHandler");
const { setSocketInstance } = require("./websocket/socketManager");
require("dotenv").config();
const gameLoop = require("./utils/gameLoop");
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
// WebSocket
const io = new Server(server, {
  cors: {
    origin: `${process.env.BASE_URL}`,
    methods: ["GET", "POST"],
  },
});

// Start game loop after WebSocket is ready
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);
});
socketHandler(io);
setSocketInstance(io);
gameLoop(io); // start the loop
// Connect DB and start server
connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

});
