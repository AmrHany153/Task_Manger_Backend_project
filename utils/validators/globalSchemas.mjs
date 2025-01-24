import { body} from "express-validator"
import db from "../../database/index.mjs"
import asyncHandler from "express-async-handler";


/* idSchema's parameters
requestDataValidator: takes one of {body, param, query}
existenceInRequest: element existence in one of {body, param, query}, takes on of {REQUIRED, OPTIONAL, undefined}
databaseTable: databaseTable 
existenceInDatabase: element existence in the table, takes one of {MUST, MUST_NOT, undefined}
customTargetField: for using the same code with different targetField Name

NOTE: undefined means off this future
*/ 
export const idSchema = (requestDataValidator, existenceInRequest, databaseTable, existenceInDatabase, customTargetField = "id") =>
    generateValidationRule(requestDataValidator, existenceInRequest, customTargetField)
        .isNumeric().withMessage("ID must be numeric").bail()
        .isLength({min:1, max:15}).withMessage("ID length must be between 1 and 15 characters").bail()
        // validate id existence based on the used sql table and validationFunction
        .custom(asyncHandler(async (value) => {
            if (existenceInDatabase) {
                const check = {
                    users: db.checkIfUserIdExists,
                    tasks: db.checkIfTaskIdExists,
                    statuses: db.checkIfStatusIdExists,
                }

                let isExist;

                
                if(check[databaseTable] !== undefined) {
                    isExist = await check[databaseTable](value)
                } else {
                    throw new Error(`Invalid ${databaseTable} table in id validation schema`);
                }
                
                // must exist in database
                if (existenceInDatabase === "must" && !isExist) {
                    throw new Error(`Id (${value}) of (${databaseTable}) table does not exist in database`);
                }

                // must not exist in database
                else if (existenceInDatabase === "mustNot" && isExist) {
                    throw new Error(`Id (${value}) of (${databaseTable}) table already exist in database`);
                }
            }  

            return true;
        }))

         

export const createdAtSchema = (existenceInRequest) =>
    generateValidationRule(body, existenceInRequest, "created_at")
        .isString().withMessage("Created_at must be string").bail()
        .matches(/\d{4}-\d{2}-\d{2}/).withMessage("Created_at date must contain only numbers and be like this pattern (0000-00-00) => (year-month-day)").bail()



/* generateValidationRule's parameters
requestDataValidator: takes one of {body, param, query}
existenceInRequest: element existence in one of {body, param, query}, takes on of {REQUIRED, OPTIONAL}
targetField: the name of the variable that passed 
*/
// generate validation rule based on requestDataValidator
export const generateValidationRule = (requestDataValidator, existenceInRequest, targetField, /*httpMethod,*/) =>  {
    
    // the existenceInRequest parameter has the highest priority if available
    if (existenceInRequest) {
        return existenceInRequest === "required"
            ? requestDataValidator(targetField).exists().withMessage(`${targetField} is required`).bail()
            : requestDataValidator(targetField).optional();
    }

    // == useless but clever ==
    // switch (httpMethod) {
    //     case "post":
    //     case "put":
    //         return requestDataValidator(targetField).exists().withMessage(`${targetField} is required in ${httpMethod} method`).bail();
    //     case "patch":
    //         return requestDataValidator(targetField).optional();
    //     case "delete":
    //         return requestDataValidator(targetField);
    // }

    // if method and existence parameters are undefined (for customizing)
    return requestDataValidator(targetField);
};