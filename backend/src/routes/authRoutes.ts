import express from "express";
import passport from "../config/oauth.js";
import { register, login, getProfile, updateProfile } from "../controller/authController.js";
import { oauthCallback, oauthFailure, logout } from "../controller/oauthController.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

// ==================== Traditional Auth Routes ====================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with email and password
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private (requires JWT)
 */
router.get("/profile", authenticateJWT, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private (requires JWT)
 */
router.put("/profile", authenticateJWT, updateProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", logout);

// ==================== OAuth Routes ====================

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/api/auth/failure",
        session: false, // We're using JWT, not sessions
    }),
    oauthCallback
);

/**
 * @route   GET /api/auth/failure
 * @desc    OAuth failure redirect
 * @access  Public
 */
router.get("/failure", oauthFailure);

export default router;
