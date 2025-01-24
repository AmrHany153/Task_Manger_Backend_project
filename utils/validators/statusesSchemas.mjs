import { param, body } from "express-validator"
import db from "../../database/index.mjs"
import { generateValidationRule, idSchema } from "./globalSchemas.mjs";
import { REQUIRED, OPTIONAL, MUST, MUST_NOT, ON_UPDATE, ON_DELETE } from "../constants.mjs"
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
        
        
 
// foreignKeysBehavior takes {ON_UPDATE, ON_DELETE}
const foreignKey = (foreignKeyBehavior) => 
    generateValidationRule(param, REQUIRED, "id")
        .custom(asyncHandler(async (value) => {
            const usedByTheseTasks = await db.getTasksIdsByStatusId(value);

            // if the status used by tasks
            if (usedByTheseTasks){
                throw new Error(`${foreignKeyBehavior}: restrict, tasks ids: (${usedByTheseTasks})`);
            }
            
            return true;
        }))



// main schema
export const statusesSchemas = { // id, status
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
    put: [
        // global
        idSchema(param, REQUIRED, table, MUST), /* == */ foreignKey(ON_UPDATE), 
        idSchema(body, REQUIRED, table, MUST_NOT), 

        // local
        statusSchema(REQUIRED),
    ],
    patch: [
        // global
        idSchema(param, REQUIRED, table, MUST), /* == */ foreignKey(ON_UPDATE),
        idSchema(body, OPTIONAL, table, MUST_NOT),

        // local
        statusSchema(OPTIONAL),
    ],
    delete: [
        // global
        idSchema(param, REQUIRED, table, MUST), /* == */ foreignKey(ON_DELETE),
    ],
}

export default statusesSchemas;