import { body, query } from "express-validator";
import { generateValidationRule, idSchema, nameSchema } from "./globalSchemas.mjs"
import { MUST, MUST_NOT, OPTIONAL, REQUIRED } from "../constants.mjs";

const table = "groups";

// local schemas
const isModeratorSchema = (existenceInRequest) => 
    generateValidationRule(body, existenceInRequest, "is_moderator")
        .isBoolean().withMessage("is_moderator must be boolean")


// main schema 
export const groupsSchemas = {
    // NOTE: group_id is already validated in setRole middleware by authSchemas.setRole (except you are an admin!)
    post: [
        // global
        nameSchema(body, REQUIRED, table, MUST_NOT),
    ],
    postAddMember: [
        // global
        idSchema(body, REQUIRED, "users", MUST, "user_id"),

        // local
        isModeratorSchema(OPTIONAL)
    ],
    patchMod: [
        // global
        idSchema(body, REQUIRED, "users", MUST, "user_id"),
    ],
} 

