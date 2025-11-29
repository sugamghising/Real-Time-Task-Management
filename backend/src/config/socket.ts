import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

let io: Server;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 10000,
    });

    // Authentication middleware
    io.use((socket, next) => {
        try {
            let token = socket.handshake.auth?.token;
            console.log('Socket auth attempt, token present:', !!token);
            if (!token) {
                return next(new Error("Authentication error"));
            }
            if (typeof token === "string" && token.startsWith("Bearer ")) {
                token = token.slice(7);
            }
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                return next(new Error("Server configuration error: JWT secret missing"));
            }
            // Verify token
            jwt.verify(token, secret);
            // token is valid
            next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            next(new Error("Authentication error"));
        }
    });

    // Connection handlers
    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);
        // Example event: task update from client
        socket.on("task:update", (data) => {
            // Broadcast to all other clients
            socket.broadcast.emit("task:update", data);
        });
        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};

export const getIO = () => io;