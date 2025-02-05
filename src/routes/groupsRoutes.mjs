import { Router } from "express";
import { matchedData } from "express-validator";
import asyncHandler from "express-async-handler";

// database 
import { mysql, mongo } from "../database/index.mjs";

// middlewares
import { validationErrorHandler } from "../utils/middlewares/validationErrorHandler.mjs"
import { requireOwnerOrAbove } from "../utils/middlewares/requireOwnerOrAbove.mjs";
import { requireModeratorOrAbove } from "../utils/middlewares/requireModeratorOrAbove.mjs";
import { requireMemberOrAbove } from "../utils/middlewares/requireMemberOrAbove.mjs"
import { requireAuth } from "../utils/middlewares/requireAuth.mjs";
import { groupsSchemas } from "../utils/validators/index.mjs";
import { ADMIN, OWNER } from "../utils/constants.mjs";


const router = Router();


router.post("/", requireAuth, groupsSchemas.post, validationErrorHandler, asyncHandler(async (req, res) => {
    const { name } = matchedData(req, {locations: ["body"]})    
    const { id:owner } = req.user;

    const created_at = new Date().toISOString().split('T')[0];

    const group = await mysql.groups.createRecord(name, owner, created_at)

    res.status(200).send(group);
}))


router.post("/leave", requireMemberOrAbove, asyncHandler(async (req, res) => {
    const { group_id } = matchedData(req, {locations: ["query"]})
    const { id:user_id } = req.user;
    
    if (req.user.role === OWNER) {
        throw new Error("the owner can't leave the group but can pass it to someone and leave")
    }  

    if (req.user.role === ADMIN) {
        throw new Error("you are not a member in this group")
    }

    await Promise.all([
        mongo.Group.deleteOneMember(user_id, group_id),
        mongo.User.deleteOneGroup(user_id, group_id)
    ]);

    
    res.sendStatus(200);
}))


router.post("/addMember", requireModeratorOrAbove, groupsSchemas.postAddMember, validationErrorHandler, asyncHandler(async (req, res) => {                               
    const { group_id } = matchedData(req, {locations: ["query"]});
    const { user_id, is_moderator = false } = matchedData(req, {locations: ["body"]});
    const owner = await mysql.groups.getOwnerById(group_id)

    if (user_id === owner) throw new Error("not able to add the owner as a member")

    
    const [r1, r2] = await Promise.all([
        mongo.Group.insertOneMember(user_id, group_id, is_moderator),
        mongo.User.insertOneGroup(user_id, group_id, is_moderator)
    ])

    if (!r1 || !r2) throw new Error("filed to add a member");
    
    res.sendStatus(200); 
}))


router.patch("/giveMod" , groupsSchemas.patchMod, validationErrorHandler, asyncHandler(async (req, res) => {
    const { user_id } = matchedData(req, {locations: ["body"]});
    const { group_id } = matchedData(req, {locations: ["query"]});

    const [r1, r2] = await Promise.all([
        mongo.Group.updateIsModerator(user_id, group_id, true),
        mongo.User.updateIsModerator(user_id, group_id, true)
    ])

    if (!r1 || !r2) throw new Error("the user is not found in group or already moderator");

    res.sendStatus(200);
}))

router.patch("/takeMod" , groupsSchemas.patchMod, validationErrorHandler, asyncHandler(async (req, res) => {
    const { user_id } = matchedData(req, {locations: ["body"]});
    const { group_id } = matchedData(req, {locations: ["query"]});

    const [r1, r2] = await Promise.all([
        mongo.Group.updateIsModerator(user_id, group_id, false),
        mongo.User.updateIsModerator(user_id, group_id, false)
    ])

    if (!r1 || !r2) throw new Error("the user is not found in group or not moderator");

    res.sendStatus(200);
}))


// NOTE: group_id is already validated in setRole middleware by authSchemas.setRole
router.delete("/", requireOwnerOrAbove, asyncHandler(async (req, res) => {
    const { group_id } = matchedData(req, {locations: ["query"]})
    
    await Promise.all([
        // 1- delete the group from every user
        mongo.User.deleteOneGroupFromAll(group_id),

        // 2- delete the document from mongo database
        mongo.Group.deleteDocument(group_id),
        
        // 3- delete the group tasks from mysql database
        mysql.tasks.deleteByGroup_id(group_id),

        // 4- delete the record from mysql database
        mysql.groups.deleteById(group_id),
    ]);

    res.status(200).send({ message: "group successfully deleted" })
}))


export default router;