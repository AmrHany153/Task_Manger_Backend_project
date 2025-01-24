import { Router } from "express";
import asyncHandler from "express-async-handler";
import { matchedData } from "express-validator";
import { usersSchemas } from "../utils/validators/index.mjs";

// database
import db from "../database/index.mjs";

// middlewares
import { validationErrorHandler } from "../utils/middlewares/validationErrorHandler.mjs"


const router = Router();

// -- create a user account
router.post("/", usersSchemas.post, validationErrorHandler, asyncHandler(async(req, res) => {
    const { name, username, password } = matchedData(req);
    let { created_at } = matchedData(req);

    created_at = created_at || new Date().toISOString().split('T')[0];

    const newUser = await db.createUser(name, username, password, created_at);
    res.status(200).send(newUser);

}))

// -- show users
router.get("/", asyncHandler(async (req, res) => {
    const users = await db.getUsers();
    res.status(200).send(users);

}))

router.get("/:id", usersSchemas.get, validationErrorHandler, asyncHandler(async (req, res) => {
    const { id } = matchedData(req);
    const user = await db.getUserById(id);

    res.status(200).send(user);
}))


// -- update a user data
router.put("/:id", usersSchemas.put, validationErrorHandler, asyncHandler(async (req, res) => {
    const { id, name, username, password } = matchedData(req);
    const userData = await db.updateUserRecord(id, name, username, password);

    res.status(200).send(userData);
}))

router.patch("/:id", usersSchemas.patch, validationErrorHandler, asyncHandler(async(req, res) => {
    const data = matchedData(req)

    // to return it with the changes
    let userBody = await db.getUserById(data.id);
    userBody.changed = [];

    for (const column in data) {
        switch (column) {
            case "name":
                await db.changeUserName(data.id, data.name);
                userBody.name = data.name;
                userBody.changed.push(column);
                break;

            case "username":
                await db.changeUserUsername(data.id, data.username);
                userBody.username = data.username;
                userBody.changed.push(column);
                break;

            case "password":
                await db.changeUserPassword(data.id, data.password);
                userBody.password = data.password;
                userBody.changed.push(column);
                break;

            case "created_at":
                await db.changeUserCreatedAt(data.id, data.created_at);
                userBody.created_at = data.created_at;
                userBody.changed.push(column);
                break;
        }
    }

    res.status(200).send(userBody);
}))


// -- delete a user account
router.delete("/:id", usersSchemas.delete, validationErrorHandler, asyncHandler(async (req, res) => {
    const { id } = matchedData(req);
    const isDeleted = await db.deleteUserById(id);

    if (isDeleted) {
        res.status(200).send({message: "Record successfully deleted"});
    } else {
        res.status(404).send({message: `Record Not found`})
    }
}))


export default router;