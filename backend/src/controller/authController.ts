import { Request, Response } from "express";
import { User, IUser } from "../models/User";
import { issueJwt } from "../config/oauth";

/**
 * Register a new user with email and password
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            res.status(400).json({
                success: false,
                message: "Please provide email, password, and name",
            });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
            return;
        }

        // Create new user
        const user = await User.create({
            email,
            password,
            name,
        });

        // Generate JWT token
        const token = issueJwt(user);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                    isEmailVerified: user.isEmailVerified,
                },
                token,
            },
        });
    } catch (error: any) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Error registering user",
            error: error.message,
        });
    }
};

/**
 * Login with email and password
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
            return;
        }

        // Find user and include password field
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
            return;
        }

        // Check if user registered via OAuth
        if (user.oauthProvider && !user.password) {
            res.status(400).json({
                success: false,
                message: `This account was created using ${user.oauthProvider}. Please login with ${user.oauthProvider}.`,
            });
            return;
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
            return;
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = issueJwt(user);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                    isEmailVerified: user.isEmailVerified,
                },
                token,
            },
        });
    } catch (error: any) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Error logging in",
            error: error.message,
        });
    }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.sub;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                    isEmailVerified: user.isEmailVerified,
                    oauthProvider: user.oauthProvider,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                },
            },
        });
    } catch (error: any) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching profile",
            error: error.message,
        });
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.sub;
        const { name, avatar } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        // Update fields
        if (name) user.name = name;
        if (avatar) user.avatar = avatar;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                },
            },
        });
    } catch (error: any) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message,
        });
    }
};
