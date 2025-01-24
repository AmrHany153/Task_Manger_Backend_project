import { param, body } from "express-validator"
import db from "../../database/index.mjs"
import { generateValidationRule, idSchema, createdAtSchema } from "./globalSchemas.mjs"
import asyncHandler from "express-async-handler"
import { REQUIRED, OPTIONAL, MUST } from "../constants.mjs"

const table = "users";

// local schemas: users
const usernameSchema = (existenceInRequest) =>
    generateValidationRule(body, existenceInRequest, "username")
        .isString().withMessage("Username must be string").bail()
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters').bail()
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores, and dashes').bail()
        .not().contains(' ').withMessage('Username should not contain spaces').bail()
        // validate that username is not used already
        .custom(asyncHandler(async (value) => {
            const isExist = await db.checkIfUserUsernameExists(value);
            if (isExist) throw new Error("The Username is already exist in database");
            return true;
        }))

const passwordSchema = (existenceInRequest) =>
    generateValidationRule(body, existenceInRequest, "password")
        .isString().withMessage("Password must be string").bail()
        .isLength({min:8, max:64}).withMessage("Password Must be at between 8 and 64 characters").bail()
        .matches(/[A-Z]/).withMessage("Password must contain at least 1 upper case").bail()
        .matches(/[a-z]/).withMessage("Password must contain at least 1 lower case").bail()
        .matches(/[0-9]/).withMessage("Password must contain at least 1 number").bail()
        .matches(/[@$!%*?&]/).withMessage("Password must contain at least 1 symbol of these (@$!%*?&)").bail()
        .not().contains(' ').withMessage("Password must not contain spaces").bail()

const nameSchema = (existenceInRequest) =>
    generateValidationRule(body, existenceInRequest, "name")
        .isString().withMessage("Name must be string").bail()
        .isLength({min:3, max:30}).withMessage("Name length must be between 3 and 30 characters").bail()
        .not().matches(/[^A-Za-z\s]/).withMessage("Name must only contain letters and spaces").bail()


        
// main schema
export const usersSchemas = {
    post: [
        // global
        createdAtSchema(OPTIONAL),

        // local
        nameSchema(REQUIRED),
        usernameSchema(REQUIRED),
        passwordSchema(REQUIRED),

    ],
    get: [
        // global
        idSchema(param, REQUIRED, table, MUST),

    ],
    put: [
        // global
        idSchema(param, REQUIRED, table, MUST),
        createdAtSchema(OPTIONAL),

        // local
        nameSchema(REQUIRED),
        usernameSchema(REQUIRED),
        passwordSchema(REQUIRED),
    ],
    patch: [
        // global
        idSchema(param, REQUIRED, table, MUST),
        createdAtSchema(OPTIONAL),

        // local
        nameSchema(OPTIONAL),
        usernameSchema(OPTIONAL),
        passwordSchema(OPTIONAL),
    ],
    delete: [
        // global
        idSchema(param, REQUIRED, table, MUST),
        
    ]
}

export default usersSchemas
