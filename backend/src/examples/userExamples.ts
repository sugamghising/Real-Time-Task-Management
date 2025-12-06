/**
 * Example usage of the User model
 * This file demonstrates how to use the User model for both traditional and OAuth authentication
 */

import { User } from "../models/User.js";


// ==================== Traditional Authentication Examples ====================

/**
 * Example 1: Create a new user with email and password
 */
async function createTraditionalUser() {
    try {
        const user = await User.create({
            email: "john@example.com",
            password: "securePassword123", // Will be automatically hashed
            name: "John Doe",
        });

        console.log("User created:", {
            id: user._id,
            email: user.email,
            name: user.name,
        });

        return user;
    } catch (error) {
        console.error("Error creating user:", error);
    }
}

/**
 * Example 2: Authenticate a user (login)
 */
async function authenticateUser(email: string, password: string) {
    try {
        // Find user and include password field (it's excluded by default)
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            console.log("User not found");
            return null;
        }

        // Compare password using the model method
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        console.log("User authenticated successfully");
        return user;
    } catch (error) {
        console.error("Error authenticating user:", error);
        return null;
    }
}

/**
 * Example 3: Update user profile
 */
async function updateUserProfile(userId: string, updates: { name?: string; avatar?: string }) {
    try {
        const user = await User.findById(userId);

        if (!user) {
            console.log("User not found");
            return null;
        }

        if (updates.name) user.name = updates.name;
        if (updates.avatar) user.avatar = updates.avatar;

        await user.save();

        console.log("User updated:", user);
        return user;
    } catch (error) {
        console.error("Error updating user:", error);
        return null;
    }
}

// ==================== OAuth Authentication Examples ====================

/**
 * Example 4: Find or create OAuth user (Google)
 */
async function handleGoogleOAuth(googleProfile: any) {
    try {
        const user = await (User as any).findOrCreateOAuthUser({
            provider: "google",
            id: googleProfile.id,
            email: googleProfile.emails[0].value,
            name: googleProfile.displayName,
            avatar: googleProfile.photos?.[0]?.value,
        });

        console.log("OAuth user:", {
            id: user._id,
            email: user.email,
            name: user.name,
            provider: user.oauthProvider,
        });

        return user;
    } catch (error) {
        console.error("Error handling OAuth:", error);
        return null;
    }
}

/**
 * Example 5: Check if user exists and their auth method
 */
async function checkUserAuthMethod(email: string) {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found");
            return null;
        }

        if (user.oauthProvider) {
            console.log(`User registered via ${user.oauthProvider}`);
            return {
                method: "oauth",
                provider: user.oauthProvider,
            };
        } else {
            console.log("User registered via email/password");
            return {
                method: "traditional",
            };
        }
    } catch (error) {
        console.error("Error checking user:", error);
        return null;
    }
}

/**
 * Example 6: Link OAuth account to existing user
 * This happens automatically in findOrCreateOAuthUser, but here's how it works
 */
async function linkOAuthToExistingUser(email: string, oauthData: any) {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found");
            return null;
        }

        // Link OAuth account
        user.oauthProvider = oauthData.provider;
        user.oauthId = oauthData.id;
        user.isEmailVerified = true; // OAuth emails are verified

        if (oauthData.avatar && !user.avatar) {
            user.avatar = oauthData.avatar;
        }

        await user.save();

        console.log("OAuth account linked successfully");
        return user;
    } catch (error) {
        console.error("Error linking OAuth:", error);
        return null;
    }
}

// ==================== Query Examples ====================

/**
 * Example 7: Find all users registered via OAuth
 */
async function findOAuthUsers() {
    try {
        const users = await User.find({
            oauthProvider: { $ne: null },
        });

        console.log(`Found ${users.length} OAuth users`);
        return users;
    } catch (error) {
        console.error("Error finding OAuth users:", error);
        return [];
    }
}

/**
 * Example 8: Find all users registered traditionally
 */
async function findTraditionalUsers() {
    try {
        const users = await User.find({
            oauthProvider: null,
        });

        console.log(`Found ${users.length} traditional users`);
        return users;
    } catch (error) {
        console.error("Error finding traditional users:", error);
        return [];
    }
}

/**
 * Example 9: Find users by provider
 */
async function findUsersByProvider(provider: "google" | "github" | "facebook") {
    try {
        const users = await User.find({
            oauthProvider: provider,
        });

        console.log(`Found ${users.length} ${provider} users`);
        return users;
    } catch (error) {
        console.error("Error finding users by provider:", error);
        return [];
    }
}

/**
 * Example 10: Get user statistics
 */
async function getUserStatistics() {
    try {
        const totalUsers = await User.countDocuments();
        const oauthUsers = await User.countDocuments({ oauthProvider: { $ne: null } });
        const traditionalUsers = await User.countDocuments({ oauthProvider: null });
        const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
        const activeUsers = await User.countDocuments({ isActive: true });

        const stats = {
            total: totalUsers,
            oauth: oauthUsers,
            traditional: traditionalUsers,
            verified: verifiedUsers,
            active: activeUsers,
        };

        console.log("User statistics:", stats);
        return stats;
    } catch (error) {
        console.error("Error getting statistics:", error);
        return null;
    }
}

// Export examples
export {
    createTraditionalUser,
    authenticateUser,
    updateUserProfile,
    handleGoogleOAuth,
    checkUserAuthMethod,
    linkOAuthToExistingUser,
    findOAuthUsers,
    findTraditionalUsers,
    findUsersByProvider,
    getUserStatistics,
};
