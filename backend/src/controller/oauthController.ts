import { Request, Response } from "express";
import { issueJwt } from "../config/oauth.js";

/**
 * Handle successful OAuth callback
 * This is called after passport authenticates the user
 */
export const oauthCallback = (req: Request, res: Response): void => {
    try {
        const user = req.user as any;

        if (!user) {
            // Redirect to frontend with error
            res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/error?message=Authentication failed`);
            return;
        }

        // Generate JWT token
        const token = issueJwt(user);

        // Redirect to frontend with token
        // The frontend should extract the token from the URL and store it
        res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/success?token=${token}`);
    } catch (error: any) {
        console.error("OAuth callback error:", error);
        res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/error?message=Authentication failed`);
    }
};

/**
 * Handle OAuth failure
 */
export const oauthFailure = (req: Request, res: Response): void => {
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/error?message=Authentication failed`);
};

/**
 * Logout user
 */
export const logout = (req: Request, res: Response): void => {
    req.logout((err) => {
        if (err) {
            res.status(500).json({
                success: false,
                message: "Error logging out",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    });
};
