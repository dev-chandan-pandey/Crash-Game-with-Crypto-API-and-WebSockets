import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // backend WebSocket URL

export default socket;
