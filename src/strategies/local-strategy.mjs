import passport from "passport";
import { Strategy } from "passport-local";
import { mysql } from "../database/index.mjs"
import { comparePassword } from "../utils/functions/comparePassword.mjs";

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await mysql.users.getById(id);
        
        if (!user) throw new Error("User not found!")

        done(null, user)
    } catch (err) {
        done(err, null);
    }
})

export default passport.use(
    new Strategy(async (username, password, done) => {
        try {
            const user = await mysql.users.getByUsername(username);  

            if (!user || !comparePassword(password, user.password)) {
                throw new Error("Invalid Credential!")
            }

            done(null, user);
        } catch (err) {
            done(err, null);
        }
    })
)