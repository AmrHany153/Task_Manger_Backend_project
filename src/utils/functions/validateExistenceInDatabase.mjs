import { mysql } from "../../database/index.mjs";
import { MUST, MUST_NOT } from "../constants.mjs"

const tableChecks = {
    users: {
        id: mysql.users.checkIfUserIdExists,
        name: mysql.users.checkIfUserNameExists,
        username: mysql.users.checkIfUserUsernameExists,
    },
    tasks: {
        id: mysql.tasks.checkIfTaskIdExists,
        title: mysql.tasks.checkIfTaskTitleExists,
    },
    statuses: {
        id: mysql.statuses.checkIfStatusIdExists,
        status: mysql.statuses.checkIfNameExists,
    },
    groups: {
        id: mysql.groups.checkIfGroupIdExists,
        name: mysql.groups.checkIfGroupNameExists
    }
};


/**
 * Validates existence of a value in database table
 * @param {keyof tableChecks} databaseTable - Target table name
 * @param {*} existenceInDatabase - Existence requirement 
 * (must use imported constants: MUST or MUST_NOT from './constants.mjs')
 * @param {string} TargetField - Field name to validate
 * @param {*} value - Value to check
 * @returns {Promise<boolean>} Validation result
 * @throws {Error} Throws error for:
 * - Invalid table
 * - Invalid field
 * - Existence requirement conflict
 * 
 * @example
 * import { MUST, MUST_NOT } from './constants.mjs';
 * await validateExistenceInDatabase('users', MUST, 'id', 123);
 * await validateExistenceInDatabase('tasks', MUST_NOT, 'title', 'New Task');
 */
export async function validateExistenceInDatabase(databaseTable, existenceInDatabase, TargetField, value) {
    if (existenceInDatabase) {

        if (!tableChecks[databaseTable]) {
            throw new Error(`The (${databaseTable}) table is not valid in validateExistenceInDatabase function`);
        }

        if (!tableChecks[databaseTable][TargetField]) {
            throw new Error(`The (${TargetField}) column is not valid in (${databaseTable}) table in validateExistenceInDatabase function`);
        }
        
        const isExist = await tableChecks[databaseTable][TargetField](value);

        // must exist in database
        if (existenceInDatabase === MUST && !isExist) {
            throw new Error(`(${value}) of (${databaseTable}) table does not exist in database`);
        }

        // must not exist in database
        else if (existenceInDatabase === MUST_NOT && isExist) {
            throw new Error(`(${value}) of (${databaseTable}) table already exist in database`);
        }
    }  

    return true;
}