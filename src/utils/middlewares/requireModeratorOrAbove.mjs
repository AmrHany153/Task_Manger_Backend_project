import { ADMIN, MODERATOR, OWNER } from "../constants.mjs"
import { requireAuth } from "./requireAuth.mjs";

export const requireModeratorOrAbove = [requireAuth ,(req, res, next) => {
    const role = req.user.role;

    if (role === ADMIN || role === OWNER || role === MODERATOR) {
        return next();
    }
    
    res.sendStatus(403);
}]