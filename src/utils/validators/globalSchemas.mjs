import { REQUIRED, OPTIONAL, MUST_NOT } from "../constants.mjs"
import asyncHandler from "express-async-handler";
import { validateExistenceInDatabase } from "../functions/validateExistenceInDatabase.mjs"



/**
 * Generates ID validation schema with database existence check
 * @param {function(string): ValidationChain} requestDataValidator - Validator method (body/param/query)
 * @param {*} [existenceInRequest] - Field requirement in request
 * (must use imported constants: REQUIRED or OPTIONAL from './constants.mjs')
 * @param {string} databaseTable - Database table for existence check
 * @param {*} existenceInDatabase - Whether ID must exist in database or not
 * (must use imported constants: MUST or MUST_NOT from './constants.mjs')
 * @param {string} [customTargetField="id"] - Field name (default: "id")
 * @returns {ValidationChain} Express-validator validation chain
 * 
 * @example
 * import { REQUIRED, OPTIONAL, MUST, MUST_NOT } from './constants.mjs';
 * idSchema(body, REQUIRED, 'users', MUST) // Required ID in body that exists in 'users' table
 */
export const idSchema = (requestDataValidator, existenceInRequest, databaseTable, existenceInDatabase, customTargetField = "id") =>
    generateValidationRule(requestDataValidator, existenceInRequest, customTargetField)
        .isNumeric().withMessage(`${customTargetField} must be numeric`).bail()
        .isLength({min:1, max:15}).withMessage(`${customTargetField} length must be between 1 and 15 characters`).bail()
        // validate id existence based on databaseTable and existenceInDatabase
        .custom(asyncHandler(async (value) => { 
            return validateExistenceInDatabase(databaseTable, existenceInDatabase, customTargetField, value) 
        }))



/**
 * Generates name validation schema with database existence check
 * @param {function(string): ValidationChain} requestDataValidator - Validator method (body/param/query)
 * @param {*} [existenceInRequest] - Field requirement in request
 * (must use imported constants: REQUIRED or OPTIONAL from './constants.mjs')
 * @param {string} databaseTable - Database table for existence check
 * @param {*} existenceInDatabase - Whether name must exist in database or not
 * (must use imported constants: MUST or MUST_NOT from './constants.mjs')
 * @param {string} [customTargetField="name"] - Field name (default: "name")
 * @returns {ValidationChain} Express-validator validation chain
 * 
 * @example
 * import { REQUIRED, OPTIONAL, MUST, MUST_NOT } from './constants.mjs';
 * nameSchema(body, REQUIRED, 'users', MUST_NOT) // Required name in body that doesn't exist in 'users' table
 */
export const nameSchema = (requestDataValidator, existenceInRequest, databaseTable, existenceInDatabase, customTargetField = "name") => 
    generateValidationRule(requestDataValidator, existenceInRequest, customTargetField)
        .trim()
        .isString().withMessage(`${customTargetField} must be string`).bail()
        .isLength({min:3,max:15}).withMessage(`${customTargetField} length must be between 3 and 15 characters`).bail()
        .matches(/^[a-zA-Z_-]+$/).withMessage(`${customTargetField} can only contain letters, underscores, and dashes`).bail()
        // validate name existence based on databaseTable and existenceInDatabase
        .custom(asyncHandler(async (value) => {
            return validateExistenceInDatabase(databaseTable, existenceInDatabase, customTargetField, value)
        }))



/**
 * Generates username validation schema with database existence check
 * @param {function(string): ValidationChain} requestDataValidator - Validator method (body/param/query)
 * @param {*} [existenceInRequest] - Field requirement in request
 * (must use imported constants: REQUIRED or OPTIONAL from './constants.mjs')
 * @param {string} databaseTable - Database table for existence check
 * @param {*} existenceInDatabase - Whether username must exist in database or not
 * (must use imported constants: MUST or MUST_NOT from './constants.mjs')
 * @param {string} [customTargetField="username"] - Field name (default: "username")
 * @returns {ValidationChain} Express-validator validation chain
 * 
 * @example
 * import { REQUIRED, OPTIONAL, MUST, MUST_NOT } from './constants.mjs';
 * usernameSchema(param, OPTIONAL, 'tasks', MUST_NOT) // Optional username in params that shouldn't exist in 'profiles'
 */
export const usernameSchema = (requestDataValidator, existenceInRequest, databaseTable, existenceInDatabase, customTargetField = "username") =>
    generateValidationRule(requestDataValidator, existenceInRequest, customTargetField)
        .isString().withMessage(`${customTargetField} must be string`).bail()
        .isLength({ min: 3, max: 20 }).withMessage(`${customTargetField} must be between 3 and 20 characters`).bail()
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage(`${customTargetField} can only contain letters, numbers, underscores, and dashes`).bail()
        .not().contains(' ').withMessage(`${customTargetField} should not contain spaces`).bail()
        // validate id existence based on databaseTable and existenceInDatabase
        .custom(asyncHandler(async (value) => { 
            return validateExistenceInDatabase(databaseTable, existenceInDatabase, customTargetField, value) 
        }))
 


/**
 * Generates password validation schema with complexity rules
 * @param {function(string): ValidationChain} requestDataValidator - Validator method (body/param/query)
 * @param {*} [existenceInRequest] - Field requirement in request
 * (must use imported constants: REQUIRED or OPTIONAL from './constants.mjs')
 * @param {string} [customTargetField="password"] - Field name (default: "password")
 * @returns {ValidationChain} Express-validator validation chain
 * 
 * @example
 * import { REQUIRED, OPTIONAL } from './constants.mjs';
 * passwordSchema(body, REQUIRED) // Validate required password in body
 */
export const passwordSchema = (requestDataValidator, existenceInRequest, customTargetField = "password") =>
    generateValidationRule(requestDataValidator, existenceInRequest, customTargetField)
        .isString().withMessage(`${customTargetField} must be string`)
        .isLength({min:8, max:64}).withMessage(`${customTargetField} Must be at between 8 and 64 characters`)
        .matches(/[A-Z]/).withMessage(`${customTargetField} must contain at least 1 upper case`)
        .matches(/[a-z]/).withMessage(`${customTargetField} must contain at least 1 lower case`)
        .matches(/[0-9]/).withMessage(`${customTargetField} must contain at least 1 number`)
        .matches(/[@$!%*?&]/).withMessage(`${customTargetField} must contain at least 1 symbol of these (@$!%*?&)`)
        .not().contains(' ').withMessage(`${customTargetField} must not contain spaces`)


/**
 * Generates created_at timestamp validation schema
 * @param {function(string): ValidationChain} requestDataValidator - Validator method (body/param/query)
 * @param {*} [existenceInRequest] - Field requirement in request 
 * (must use imported constants: REQUIRED or OPTIONAL from './constants.mjs')
 * @param {string} [customTargetField="created_at"] - Field name (default: "created_at")
 * @returns {ValidationChain} Express-validator validation chain
 * 
 * @example
 * import { REQUIRED, OPTIONAL } from './constants.mjs';
 * createdAtSchema(query, OPTIONAL) // Validate optional created_at in query
 */
export const createdAtSchema = (requestDataValidator, existenceInRequest, customTargetField = "created_at") =>
    generateValidationRule(requestDataValidator, existenceInRequest, customTargetField)
        .isString().withMessage(`${customTargetField} must be string`)
        .matches(/\d{4}-\d{2}-\d{2}/).withMessage(`${customTargetField} date must contain only numbers and be like this pattern (0000-00-00) => (year-month-day)`)





/**
 * Generates express-validator validation chain based on requirements
 * 
 * @param {function(string): ValidationChain} requestDataValidator - Validator method (e.g. body, param, query)
 * @param {*} [existenceInRequest] - Field requirement level 
 * (must use imported constants: REQUIRED or OPTIONAL from './constants.mjs')
 * @param {string} targetField - Field name to validate
 * @returns {ValidationChain} Express-validator validation chain
 * 
 * @example
 * import { REQUIRED, OPTIONAL } from './constants.mjs';
 * generateValidationRule(body, REQUIRED, 'email') // Required field validation
 * generateValidationRule(param, OPTIONAL, 'id') // Optional field validation
 */
export const generateValidationRule = (requestDataValidator, existenceInRequest, targetField) =>  {
    
    // the existenceInRequest parameter has the highest priority (if available)
    if (existenceInRequest) {
        if (existenceInRequest === REQUIRED) return requestDataValidator(targetField).exists().withMessage(`${targetField} is required`).bail();
        else if (existenceInRequest === OPTIONAL) return requestDataValidator(targetField).optional();
        else throw new Error("existenceInRequest parameter must be from constants file")
    }

    // if existenceInRequest parameter is undefined (turned off)
    return requestDataValidator(targetField);
};