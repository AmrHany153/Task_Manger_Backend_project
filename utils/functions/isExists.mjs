import db from "../../database/index.mjs";

const tableChecks = {
    users: {
        id: db.checkIfUserIdExists,
        name: db.checkIfUserNameExists,
        username: db.checkIfUserUsernameExists,
    },
    tasks: {
        id: db.checkIfTaskIdExists,
        title: db.checkIfTaskTitleExists,
    },
    statuses: {
        id: db.checkIfStatusIdExists,
        status: db.checkIfStatusExists,
    },
};

export async function isExists(table, column, value) {
    try {
        if (!tableChecks[table]) {
            throw new Error(`The (${table}) table is not valid in isExists function`);
        }

        const checkFunction = tableChecks[table][column](value);
        if (!checkFunction) {
            throw new Error(`The (${column}) column is not valid in (${table}) table in isExists function`);
        }

        return await checkFunction(value);
    } catch (error) {
        throw new Error(`Error checking existence: ${error.message}`);
    }
}
