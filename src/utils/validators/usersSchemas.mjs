import { param, body } from "express-validator"
import { mysql } from "../../database/index.mjs"
import { generateValidationRule, idSchema, usernameSchema, passwordSchema, createdAtSchema } from "./globalSchemas.mjs"
import asyncHandler from "express-async-handler"
import { REQUIRED, OPTIONAL, MUST, ON_UPDATE, ON_DELETE, MUST_NOT } from "../constants.mjs"

const table = "users";

// local schemas: users
const nameSchema = (existenceInRequest) =>
    generateValidationRule(body, existenceInRequest, "name")
        .isString().withMessage("Name must be string").bail()
        .isLength({min:3, max:30}).withMessage("Name length must be between 3 and 30 characters").bail()
        .not().matches(/[^A-Za-z\s]/).withMessage("Name must only contain letters and spaces").bail()


// foreignKeysBehavior takes {ON_UPDATE, ON_DELETE}       
const foreignKey = (foreignKeyBehavior) => 
    generateValidationRule(param, REQUIRED, "id")
        .custom(asyncHandler(async (value) => {
            const usedByTheseTasks = await mysql.tasks.getTasksIdsByStatusId(value);

            // if the status used by tasks
            if (usedByTheseTasks){
                console.log(`${foreignKeyBehavior}: cascade, changed tasks ids: (${usedByTheseTasks})`);
            }
            
            return true;
        }))


// main schema
export const usersSchemas = {
    post: [
        // global
        usernameSchema(body, REQUIRED, table, MUST_NOT),
        passwordSchema(body, REQUIRED),

        // local
        nameSchema(REQUIRED),

    ],
    get: [
        // global
        idSchema(param, REQUIRED, table, MUST),

    ],
    put: [
        // global
        idSchema(param, REQUIRED, table, MUST), /* == */ foreignKey(ON_UPDATE),
        usernameSchema(body, REQUIRED, table, MUST_NOT),
        passwordSchema(body, REQUIRED),

        // local
        nameSchema(REQUIRED),
    ],
    patch: [
        // global
        idSchema(param, REQUIRED, table, MUST), /* == */ foreignKey(ON_UPDATE),
        usernameSchema(body, OPTIONAL, table, MUST_NOT),
        passwordSchema(body, OPTIONAL),
        createdAtSchema(body, OPTIONAL),

        // local
        nameSchema(OPTIONAL),
    ],
    deleteMe: [
        // global
        passwordSchema(body, REQUIRED),
    ],
    delete: [
        // global
        idSchema(param, REQUIRED, table, MUST), /* == */ foreignKey(ON_DELETE),
        passwordSchema(body, REQUIRED),
    ]
}

export default usersSchemas
