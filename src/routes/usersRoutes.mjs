import { Router } from "express";
import asyncHandler from "express-async-handler";
import { matchedData } from "express-validator";
import { usersSchemas } from "../utils/validators/index.mjs";

// database
import { mysql, mongo } from "../database/index.mjs";

// middlewares
import { validationErrorHandler } from "../utils/middlewares/validationErrorHandler.mjs"
import { requireAuth } from "../utils/middlewares/requireAuth.mjs";
import { requireAdmin } from "../utils/middlewares/requireAdmin.mjs";

// functions
import { hashPassword } from "../utils/functions/hashPassword.mjs";


const router = Router();



router.post("/", usersSchemas.post, validationErrorHandler, asyncHandler(async (req, res) => {
    const { name, username } = matchedData(req, {locations: ["body"]});
    
    let { password } = matchedData(req, {locations: ["body"]})
    password = hashPassword(password);

    const created_at = new Date().toISOString().split('T')[0];

    const newUser = await mysql.users.createRecord(name, username, password, created_at);
    delete newUser.password
    res.status(200).send(newUser);
}))


// -- User Role
router.get("/me", requireAuth, asyncHandler(async (req, res) => {
    delete req.user.password
    res.status(200).send(req.user)
}))

router.put("/me", requireAuth, usersSchemas.put, validationErrorHandler, asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { name, username, password } = matchedData(req);
    const userData = await mysql.users.changeRecord(id, name, username, password);

    res.status(200).send(userData);
}))

router.delete("/me", requireAuth, usersSchemas.deleteMe, validationErrorHandler, asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { password } = matchedData(req, {locations: ["body"]});

    let isDeleted = undefined; 

    if (req.user.password === password) isDeleted = await mysql.users.deleteById(id);

    if (isDeleted) {
        res.status(200).send({ message: "Record successfully deleted" });
    } else {
        res.status(404).send({ message: `Record Not found` })
    }
}))


// -- Admin Role
router.get("/", requireAdmin, asyncHandler(async (req, res) => {
    const users = await mysql.users.getAll();
    res.status(200).send(users);
}))

router.get("/:id", requireAdmin, usersSchemas.get, validationErrorHandler, asyncHandler(async (req, res) => {
    const { id } = matchedData(req);
    const user = await mysql.users.getById(id);

    res.status(200).send(user);
}))

router.patch("/:id", requireAdmin, usersSchemas.patch, validationErrorHandler, asyncHandler(async (req, res) => {
    const data = matchedData(req)

    // to return it with the changes
    let userBody = await mysql.users.getById(data.id);
    userBody.changed = [];

    for (const column in data) {
        switch (column) {
            case "name":
                await mysql.users.changeName(data.id, data.name);
                userBody.name = data.name;
                userBody.changed.push(column);
                break;

            case "username":
                await mysql.users.changeUsername(data.id, data.username);
                userBody.username = data.username;
                userBody.changed.push(column);
                break;

            case "password":
                await mysql.users.changePassword(data.id, data.password);
                userBody.password = data.password;
                userBody.changed.push(column);
                break;

            case "is_admin":
                await mysql.users.changeIsAdmin(data.id, data.password);
                userBody.is_admin = data.is_admin;
                userBody.changed.push(column);
                break;

            case "created_at":
                await mysql.users.changeCreatedAt(data.id, data.created_at);
                userBody.created_at = data.created_at;
                userBody.changed.push(column);
                break;
        }
    }

    res.status(200).send(userBody);
}))

router.delete("/:id", requireAdmin, usersSchemas.delete, validationErrorHandler, asyncHandler(async (req, res) => {
    const { id:user_id } = matchedData(req, {locations: ["params"]});
    const { password } = matchedData(req, {locations: ["body"]});

    let isDeleted = undefined; 

    if (req.user.password === password) {
        await Promise.all([
            mysql.users.deleteById(user_id),
            mongo.Group.deleteOneMemberFromAll(user_id)
        ]);
        
        res.status(200).send({ message: "Record successfully deleted" });
    }

    if (isDeleted) {
        res.status(200).send({ message: "Record successfully deleted" });
    } else {
        res.status(404).send({ message: `Record Not found` })
    }
}))



export default router; 