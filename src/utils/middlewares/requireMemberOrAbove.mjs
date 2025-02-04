import { ADMIN, MEMBER, MODERATOR, OWNER } from "../constants.mjs"
import { requireAuth } from "./requireAuth.mjs";


export const requireMemberOrAbove = [requireAuth ,(req, res, next) => {
    const role = req.user.role;

    if (role === ADMIN || role === OWNER || role === MODERATOR || role === MEMBER) {
        return next();
    }
    
    res.sendStatus(403);
}]