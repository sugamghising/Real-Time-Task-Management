import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Interface for User Document
export interface IUser extends mongoose.Document {
    email: string;
    password?: string; // Optional for OAuth users
    name: string;
    avatar?: string;

    // OAuth-specific fields
    oauthProvider?: "google" | "github" | "facebook";
    oauthId?: string;

    // Account status
    isEmailVerified: boolean;
    isActive: boolean;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;

    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Interface for User Model with static methods
export interface IUserModel extends mongoose.Model<IUser> {
    findOrCreateOAuthUser(profile: {
        provider: "google" | "github" | "facebook";
        id: string;
        email: string;
        name: string;
        avatar?: string;
    }): Promise<IUser>;
}

// User Schema
const UserSchema = new mongoose.Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: function (email: string) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                },
                message: "Please provide a valid email address",
            },
        },
        password: {
            type: String,
            required: function (this: IUser) {
                // Password is required only if not using OAuth
                return !this.oauthProvider;
            },
            minlength: [6, "Password must be at least 6 characters long"],
            select: false, // Don't return password by default
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        avatar: {
            type: String,
            default: null,
        },
        oauthProvider: {
            type: String,
            enum: ["google", "github", "facebook"],
            default: null,
        },
        oauthId: {
            type: String,
            default: null,
            sparse: true, // Allow multiple null values but unique non-null values
        },
        isEmailVerified: {
            type: Boolean,
            default: function (this: IUser) {
                // Auto-verify if using OAuth
                return !!this.oauthProvider;
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ oauthProvider: 1, oauthId: 1 });

// Pre-save middleware to hash password
UserSchema.pre("save", async function () {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified("password") || !this.password) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);

    } catch (error) {
        console.error("Error hashing password:", error);
    }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    try {
        if (!this.password) {
            return false;
        }
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

// Static method to find or create OAuth user
UserSchema.statics.findOrCreateOAuthUser = async function (
    profile: {
        provider: "google" | "github" | "facebook";
        id: string;
        email: string;
        name: string;
        avatar?: string;
    }
): Promise<IUser> {
    // First, try to find user by OAuth ID and provider
    let user = await this.findOne({
        oauthProvider: profile.provider,
        oauthId: profile.id,
    });

    if (user) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        return user;
    }

    // If not found by OAuth ID, check if user exists with same email
    user = await this.findOne({ email: profile.email });

    if (user) {
        // Link OAuth account to existing user
        user.oauthProvider = profile.provider;
        user.oauthId = profile.id;
        user.isEmailVerified = true;
        user.lastLogin = new Date();
        if (profile.avatar && !user.avatar) {
            user.avatar = profile.avatar;
        }
        await user.save();
        return user;
    }

    // Create new user
    const newUserData: any = {
        email: profile.email,
        name: profile.name,
        oauthProvider: profile.provider,
        oauthId: profile.id,
        isEmailVerified: true,
        lastLogin: new Date(),
    };

    if (profile.avatar) {
        newUserData.avatar = profile.avatar;
    }

    user = await this.create(newUserData);
    return user;
};

// Export the model
export const User = mongoose.model<IUser, IUserModel>("User", UserSchema);
