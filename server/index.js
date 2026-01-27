import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { join, dirname } from "path";
import { fileURLToPath } from "url";



const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Serve static files from React build
const __dirname = dirname(fileURLToPath(import.meta.url));
const clientBuildPath = join(__dirname, "..", "dist");
app.use(express.static(clientBuildPath));

// SPA fallback: serve index.html for any unknown route
app.get("*", (req, res) => {
    res.sendFile(join(clientBuildPath, "index.html"));
});


io.on("connection", (socket) => {
console.log("viewer connected", socket.id);


socket.on("detections", (msg) => {
    console.log("détections",msg)
    socket.broadcast.emit("detections", msg);
});


socket.on("disconnect", () => console.log("viewer disconnected", socket.id));
});


httpServer.listen(3001, () => console.log("listening on :3001"));