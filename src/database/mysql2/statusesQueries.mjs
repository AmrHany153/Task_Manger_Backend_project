import pool from "./databaseConnection.mjs";

// -- Checking
export async function checkIfStatusIdExists(id) {
    // (!!) to make it true or false  |  ([0][0]) to get the first record
    return !!(await pool.query(`SELECT id FROM statuses WHERE id = ?`, [id]))[0][0];
}

export async function checkIfNameExists(status) {
    return !!(await pool.query(`SELECT name FROM statuses WHERE status = ?`, [status]))[0][0];
}

// -- create
export async function createRecord(id, name) {
    await pool.query(`
        INSERT INTO statuses (id, name)
        VALUES (?, ?)
    `, [id, name])

    return getById(id);
}

// -- select
export async function getAll() { 
    const [rows] = await pool.query(`
        SELECT * 
        FROM statuses
    `)

    return rows;
}

export async function getById(id) { // done
    const [rows] = await pool.query(`
        SELECT * 
        FROM statuses
        WHERE id = ?
    `, [id])

    return rows[0];
}

// -- update
export async function changeName(id, newName) { // done
    const [rows] = await pool.query(`
        UPDATE statuses
        SET name = ?
        WHERE id = ?
    `, [newName, id])

    return rows.affectedRows;
}


// -- delete
export async function deleteById(id) { // done
    const [rows] = await pool.query(`
        DELETE FROM statuses
        WHERE id = ?
    `, [id])

    return rows.affectedRows;
}
