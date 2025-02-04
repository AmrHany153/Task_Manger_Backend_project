import { ADMIN } from "../constants.mjs"
import { requireAuth } from "./requireAuth.mjs";

export const requireAdmin = [requireAuth ,(req, res, next) => {
    if (req.user.role === ADMIN) {
        return next();
    }

    res.sendStatus(403);
}]