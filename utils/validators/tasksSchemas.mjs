import { param, body, query } from "express-validator"
import { generateValidationRule, idSchema, createdAtSchema } from "./globalSchemas.mjs"
import { REQUIRED, OPTIONAL, MUST } from "../constants.mjs"


const table = "tasks";


// local schemas: tasks
const titleSchema = (existenceInRequest) => {
    // (validationFunction, field, method = undefined, existence = undefined)
    generateValidationRule(body, existenceInRequest, "title")
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 255 }).withMessage('Title must be less than 255 characters')
        .escape()
        
}

const descriptionSchema = (existenceInRequest) => {
    generateValidationRule(body, existenceInRequest, "description")
        .trim()
        .isLength({ max: 1000 }).withMessage('Description must be less than 1000 character')
        .escape()
}



// main schema
export const tasksSchemas = { // id, title, user_id, status_id, description, created_at
    post: [ 
        // global
        idSchema(body, REQUIRED, "users", MUST, "user_id"),
        idSchema(body, REQUIRED, "statuses", MUST, "status_id"),
        createdAtSchema(OPTIONAL),

        // local
        titleSchema(REQUIRED),
        descriptionSchema(OPTIONAL),
    ],
    get: [ 
        // global 
        idSchema(param, OPTIONAL, table, MUST),
        idSchema(query, OPTIONAL, "users", MUST, "user_id"),
        idSchema(query, OPTIONAL, "statuses", MUST, "status_id"),       
    ],
    put: [
        // global
        idSchema(param, REQUIRED, table, MUST),
        idSchema(body, REQUIRED, "users", MUST, "user_id"),
        idSchema(body, REQUIRED, "statuses", MUST, "status_id"),
        createdAtSchema(OPTIONAL), 

        // local
        titleSchema(REQUIRED),
        descriptionSchema(REQUIRED),
    ],
    patch: [
        // global
        idSchema(param, REQUIRED, table, MUST),
        idSchema(body, OPTIONAL, "users", MUST, "user_id"),
        idSchema(body, OPTIONAL, "statuses", MUST, "status_id"),
        createdAtSchema(OPTIONAL), 

        // local
        titleSchema(OPTIONAL),
        descriptionSchema(OPTIONAL),
    ],
    delete: [
        // global
        idSchema(param, REQUIRED, table, MUST), 
    ],
}

export default tasksSchemas;