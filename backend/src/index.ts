import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import http from "http";
import { initSocket } from "./config/socket";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});