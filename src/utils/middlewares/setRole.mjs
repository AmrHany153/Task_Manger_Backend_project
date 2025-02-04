import { matchedData } from "express-validator";
import { authSchema } from "../validators/authSchemas.mjs";
import { mysql, mongo } from "../../database/index.mjs"
import { ADMIN, OWNER, MODERATOR, MEMBER, USER } from "../constants.mjs"
import { validationErrorHandler } from "./validationErrorHandler.mjs";


export const setRole = [authSchema.setRole, validationErrorHandler, async (req, res, next) => {
    // if not logged-in
    if (!req.isAuthenticated()) return next();
    

    const { id:user_id, is_admin } = req.user;
    const { group_id } = matchedData(req, { locations: ["query"] });

    // admin role
    if (is_admin) {
        req.user.role = ADMIN;
        return next();
    }

    // when you pass group_id as a query parameter
    if (group_id) {
        
        // owner role
        const ownerID = await mysql.groups.getOwnerById(group_id);
        if (ownerID === user_id) {
            req.user.role = OWNER;
            return next();
        }

        // moderator and member roles based on is_moderator field
        const is_moderator = await mongo.User.getIsModerator(user_id, group_id);
        if (is_moderator) {
            req.user.role = MODERATOR;
        } else {
            req.user.role = MEMBER;
        }

        return next();
    }

    req.user.role = USER;
    return next();
}]