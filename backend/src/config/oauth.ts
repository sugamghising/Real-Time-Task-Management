import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User.js";

// Configure Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            callbackURL: process.env.OAUTH_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Extract user information from Google profile
                const email = profile.emails?.[0]?.value;
                const name = profile.displayName || profile.name?.givenName || "User";
                const avatar = profile.photos?.[0]?.value;

                if (!email) {
                    return done(new Error("No email found in Google profile"), undefined);
                }

                // Find or create user using the static method
                const user = await (User as any).findOrCreateOAuthUser({
                    provider: "google",
                    id: profile.id,
                    email,
                    name,
                    avatar,
                });

                return done(null, user);
            } catch (error) {
                return done(error as Error, undefined);
            }
        }
    )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
    done(null, user._id.toString());
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Helper to issue JWT after successful OAuth or login
export const issueJwt = (user: IUser) => {
    const secret = process.env.JWT_SECRET || "";
    return jwt.sign(
        {
            sub: user._id.toString(),
            email: user.email,
            name: user.name
        },
        secret,
        { expiresIn: "7d" }
    );
};

export default passport;
