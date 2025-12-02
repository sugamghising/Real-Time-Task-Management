import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

// In‑memory user store (replace with DB as needed)
const users: Record<string, any> = {};

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            callbackURL: process.env.OAUTH_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            // Find or create user
            let user = users[profile.id];
            if (!user) {
                user = { id: profile.id, displayName: profile.displayName, emails: profile.emails };
                users[profile.id] = user;
            }
            return done(null, user);
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
    const user = users[id] || null;
    done(null, user);
});

// Helper to issue JWT after successful OAuth
export const issueJwt = (user: any) => {
    const secret = process.env.JWT_SECRET || "";
    return jwt.sign({ sub: user.id, name: user.displayName }, secret, { expiresIn: "1d" });
};

export default passport;
