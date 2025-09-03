import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });


io.on("connection", (socket) => {
console.log("viewer connected", socket.id);


socket.on("detections", (msg) => {
    console.log("détections",msg)
    socket.broadcast.emit("detections", msg);
});


socket.on("disconnect", () => console.log("viewer disconnected", socket.id));
});


httpServer.listen(3001, () => console.log("listening on :3001"));