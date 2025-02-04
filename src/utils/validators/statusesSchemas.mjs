import { param, body } from "express-validator"
import { mysql } from "../../database/index.mjs"
import { generateValidationRule, idSchema, nameSchema } from "./globalSchemas.mjs";
import { REQUIRED, OPTIONAL, MUST, MUST_NOT, ON_UPDATE, ON_DELETE } from "../constants.mjs"
import asyncHandler from "express-async-handler";


const table = "statuses";

        
 
// foreignKeysBehavior takes {ON_UPDATE, ON_DELETE}
const foreignKey = (foreignKeyBehavior) => 
    generateValidationRule(param, REQUIRED, "id")
        .custom(asyncHandler(async (value) => {
            const usedByTheseTasks = await mysql.tasks.getTasksIdsByStatusId(value);

            // if the status used by tasks
            if (usedByTheseTasks){
                throw new Error(`${foreignKeyBehavior}: restrict, tasks ids: (${usedByTheseTasks})`);
            }
            
            return true;
        }))



// main schema
export const statusesSchemas = { // id, status
    post: [
        idSchema(body, OPTIONAL, table, MUST_NOT),
        nameSchema(body, REQUIRED, table, MUST_NOT)
    ],
    get: [
        idSchema(param, REQUIRED, table, MUST),
    ],
    put: [
        idSchema(param, REQUIRED, table, MUST), /* == */ foreignKey(ON_UPDATE), 
        idSchema(body, REQUIRED, table, MUST_NOT), 
        nameSchema(body, REQUIRED, table, MUST_NOT)
    ],
    patch: [
        idSchema(param, REQUIRED, table, MUST), /* == */ foreignKey(ON_UPDATE),
        idSchema(body, OPTIONAL, table, MUST_NOT),
        nameSchema(body, OPTIONAL, table, MUST_NOT)
    ],
    delete: [
        idSchema(param, REQUIRED, table, MUST), /* == */ foreignKey(ON_DELETE),
    ],
}

export default statusesSchemas;