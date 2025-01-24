import { param, body } from "express-validator"
import db from "../../database/index.mjs"
import { generateValidationRule, idSchema } from "./globalSchemas.mjs";
import { REQUIRED, OPTIONAL, MUST, MUST_NOT } from "../constants.mjs"
import asyncHandler from "express-async-handler";

const table = "statuses";

// TODO 3: add trim() and escape() to all schemas

// local schemas: statuses
const statusSchema = (existenceInRequest) =>
    generateValidationRule(body, existenceInRequest, "status")
        .trim()
        .isString().withMessage("Status must be string").bail()
        .isLength({min:3,max:15}).withMessage("Status length must be between 3 and 15 characters").bail()
        .matches(/^[a-zA-Z_-]+$/).withMessage("Status can only contain letters, underscores, and dashes").bail()
        // validate that status is not already exist in database
        .custom(asyncHandler(async (value) => {
            const isExist = await db.checkIfStatusExists(value);
            if (isExist) throw new Error(`Status name is already exist in data base`);
            return true;
        }))


// main schema
export const statusesSchemas = {
    post: [
        // global
        idSchema(body, OPTIONAL, table, MUST_NOT),

        // local
        statusSchema(REQUIRED),
    ],
    get: [
        // global
        idSchema(param, REQUIRED, table, MUST),
    ],
    // TODO 1: build onUpdate schema
    put: [
        // global
        idSchema(param, REQUIRED, table, MUST),

        // local
        statusSchema(REQUIRED)

    ],
    patch: [
        // global
        idSchema(param, REQUIRED, table, MUST),

        // local
        statusSchema(OPTIONAL)
    ],
    // TODO 1: build onDelete schema
    delete: [
        // global
        idSchema(param, REQUIRED, table, MUST),
        
    ],
}

export default statusesSchemas;