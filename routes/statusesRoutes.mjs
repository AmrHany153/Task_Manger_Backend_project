import { Router } from "express";
import asyncHandler from "express-async-handler";
import { matchedData } from "express-validator";
import { statusesSchemas } from "../utils/validators/index.mjs";

// database
import db from "../database/index.mjs";

// middlewares
import {validationErrorHandler} from "../utils/middlewares/validationErrorHandler.mjs"

const router = Router();

// -- create statuses
router.post("/", statusesSchemas.post, validationErrorHandler, asyncHandler(async (req, res) => {
    const {id, status} = matchedData(req);
    const data = await db.createStatus(id, status);
    res.status(200).send(data);
}))

// -- show statuses
router.get("/", asyncHandler(async (req, res) => {
    const statuses = await db.getStatuses();
    res.status(200).send(statuses);
}))

router.get("/:id", statusesSchemas.get, validationErrorHandler, asyncHandler(async (req, res) => {
    const {id} = matchedData(req)
    const status = await db.getStatus(id);
    res.status(200).send(status);
}))

// -- update
router.put("/:id", statusesSchemas.put, validationErrorHandler, asyncHandler(
    async (req, res) => {
        const { id, status } = matchedData(req);
        const statusData = await db.updateStatusRecord(id, status)

        res.status(200).send(statusData);
    }
))

router.patch("/:id", statusesSchemas.patch, validationErrorHandler,  asyncHandler(async(req, res) => {
    const {id} = matchedData(req, {locations: ["params"]});
    const data = matchedData(req, {locations: ["body"]});

    // to return it with the changes
    let statusBody = await db.getStatus(id);
    statusBody.changed = [];

    for (const column in data) {
        switch (column) {
            case "id":
                await db.changeStatusId(id, data.id);
                statusBody.id = data.id;
                statusBody.changed.push(column);
                break;

            case "status":
                await db.changeStatusName(id, data.status);
                statusBody.status = data.status;
                statusBody.changed.push(column);
                break;
        }
    }
    res.status(200).send(statusBody);
}))

// -- delete
router.delete("/:id", statusesSchemas.delete, validationErrorHandler, asyncHandler(async (req, res) => {
    const {id} = matchedData(req);
    const result = await db.deleteStatus(id);

    if (result.deleted_count > 0) {
        res.status(200).send({message: `Record Deleted successfully`})
    } else {
        res.status(404).send({message: `Record Not found`})
    }
}))


export default router;