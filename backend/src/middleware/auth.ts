import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT token
 */
export const authenticateJWT = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "No token provided",
            });
            return;
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix

        // Verify token
        const secret = process.env.JWT_SECRET || "";
        const decoded = jwt.verify(token, secret);

        // Attach user info to request
        (req as any).user = decoded;

        next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({
                success: false,
                message: "Token expired",
            });
            return;
        }

        if (error.name === "JsonWebTokenError") {
            res.status(401).json({
                success: false,
                message: "Invalid token",
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: "Error authenticating token",
        });
    }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token
 */
export const optionalAuth = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            next();
            return;
        }

        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET || "";
        const decoded = jwt.verify(token, secret);

        (req as any).user = decoded;
        next();
    } catch (error) {
        // Continue without user info
        next();
    }
};
