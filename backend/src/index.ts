import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import http from "http";
import { initSocket } from "./config/socket";
import { connectDB } from "./config/database";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
initSocket(server);

// Connect to MongoDB and start server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});