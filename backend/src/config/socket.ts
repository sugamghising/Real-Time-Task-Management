import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export const initSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 10000,
    });

    io.use((socket, next) => {
        try {
            let token = socket.handshake.auth.token;
            console.log('Socket auth attempt, token present:', !!token);
            if (!token) {
                return next(new Error("Authentication error"));
            }
            if (typeof token === 'string' && token.startsWith('Bearer ')) {
                token = token.slice(7);
            }


        } catch (error) {

        }
    })
}