import { ADMIN, OWNER } from "../constants.mjs";
import { requireAuth } from "./requireAuth.mjs";

export const requireOwnerOrAbove = [requireAuth ,(req, res, next) => {
    const role = req.user.role;
    
    if (role === ADMIN || role === OWNER) {
        return next();
    }

    res.sendStatus(403);
}]