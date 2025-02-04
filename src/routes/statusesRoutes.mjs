import { Router } from "express";
import asyncHandler from "express-async-handler";
import { matchedData } from "express-validator";
import { statusesSchemas } from "../utils/validators/index.mjs";

// database
import { mysql } from "../database/index.mjs";

// middlewares
import {validationErrorHandler} from "../utils/middlewares/validationErrorHandler.mjs"
import { requireAdmin } from "../utils/middlewares/requireAdmin.mjs";

const router = Router();


// -- create statuses
router.post("/", statusesSchemas.post, validationErrorHandler, asyncHandler(async (req, res) => {
    const {id, name} = matchedData(req);
    const data = await mysql.statuses.createRecord(id, name);
    res.status(200).send(data);
}))

// -- show statuses
router.get("/", asyncHandler(async (req, res) => {
    const statuses = await mysql.statuses.getAll();
    res.status(200).send(statuses);
}))

router.get("/:id", statusesSchemas.get, validationErrorHandler, asyncHandler(async (req, res) => {
    const {id} = matchedData(req)
    const status = await mysql.statuses.getById(id);
    res.status(200).send(status);
}))

// -- update
router.put("/:id", requireAdmin, statusesSchemas.put, validationErrorHandler, asyncHandler(
    async (req, res) => {
        const { id, name } = matchedData(req);
        const statusData = await mysql.statuses.changeName(id, name)

        res.status(200).send(statusData);
    }
))

router.patch("/:id", requireAdmin, statusesSchemas.patch, validationErrorHandler,  asyncHandler(async(req, res) => {
    const {id} = matchedData(req, {locations: ["params"]});
    const data = matchedData(req, {locations: ["body"]});

    // to return it with the changes
    let statusBody = await mysql.statuses.getById(id);
    statusBody.changed = [];

    for (const column in data) {
        switch (column) {
            case "name":
                await mysql.statuses.changeName(id, data.name);
                statusBody.name = data.name;
                statusBody.changed.push(column);
                break;
        }
    }
    res.status(200).send(statusBody);
}))

// -- delete
router.delete("/:id", statusesSchemas.delete, validationErrorHandler, asyncHandler(async (req, res) => {
    const {id} = matchedData(req);
    const result = await mysql.statuses.deleteById(id);

    if (result) {
        res.status(200).send({message: `Record Deleted successfully`})
    } else {
        res.status(404).send({message: `Record Not found`})
    }
}))


export default router;