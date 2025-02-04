import { mysql } from "../../database/index.mjs"
import { body, query } from "express-validator"
import { usernameSchema, passwordSchema, idSchema } from "./globalSchemas.mjs"
import asyncHandler from "express-async-handler"
import { MUST, OPTIONAL, REQUIRED } from "../constants.mjs"


// local schemas
const groupIdSchema = (existenceInRequest) => 
    idSchema(query, existenceInRequest, "groups", MUST, "group_id")
    // validate that you are a member in this group
    .custom(asyncHandler(async (group_id, {req}) => { 
        const ownerId = await mysql.groups.getOwnerById(group_id)

        if (req.user.id === ownerId) return true;

        throw new Error(`You are not in this group => ${group_id}`)    
    }))


// main schema
export const authSchema = {
    login: [
        // global
        usernameSchema(body, REQUIRED, "users", MUST),
        passwordSchema(body, REQUIRED)
    ],

    setRole: [ // validate data that will get the role by them
        // global
        idSchema(query, OPTIONAL, "groups", MUST, "group_id"),
        
        // local
        groupIdSchema(OPTIONAL),
    ],
}