const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, cb) {
        const tokenLogin = uuidv4()
        profile.tokenLogin = tokenLogin
        try {
            if (profile?.id) {
                let response = await db.User.findOrCreate({
                    where: { id: profile.id },
                    defaults: {
                        id: profile.id,
                        email: profile.emails[0]?.value,
                        typeLogin: profile?.provider,
                        name: profile?.displayName,
                        avatarUrl: profile?.photos[0]?.value,
                        tokenLogin
                    }
                })
                if (!response[1]) {
                    await db.User.update({
                        tokenLogin
                    }, {
                        where: { id: profile.id }
                    })
                }
            }
        } catch (error) {
            console.log(error)
        }
        return cb(null, profile);

    }
));