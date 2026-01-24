const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateTokenPair } = require('./jwt');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // User exists, update avatar if empty (optional) logic
            if (!user.avatar) {
                user.avatar = profile.photos[0].value;
                await user.save();
            }
            return done(null, user);
        }

        // Create new user (handling password requirement if Schema is strict)
        // We'll give a random dummy password for OAuth users since they sign in with Google
        user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            password: 'OAUTH-' + Date.now() + Math.random().toString(36).slice(-8),
            role: 'user', // Default role
            isVerified: true
        });

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// No session serialization needed since we use JWTs manually in controller/callback
