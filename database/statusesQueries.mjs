import pool from "./databaseConnection.mjs";

// -- Checking
export async function checkIfStatusIdExists(id) {
    // (!!) to make it true or false  |  ([0][0]) to get the first record
    return !!(await pool.query(`SELECT id FROM statuses WHERE id = ?`, [id]))[0][0];
}

export async function checkIfStatusExists(status) {
    return !!(await pool.query(`SELECT status FROM statuses WHERE status = ?`, [status]))[0][0];
}

// create
export async function createStatus(id, status) { //
    /* const [rows] = */ await pool.query(`
        INSERT INTO statuses (id, status)
        VALUES (?, ?)
    `, [id, status])

    return getStatus(id);
}

// select
export async function getStatuses() { // done
    const [rows] = await pool.query(`
        SELECT * 
        FROM statuses
    `)

    return rows;
}

export async function getStatus(id) { // done
    const [rows] = await pool.query(`
        SELECT * 
        FROM statuses
        WHERE id = ?
    `, [id])

    return rows[0];
}

// update
export async function changeStatusRecord(id, newStatues) {
    /* const [rows] = */ await pool.query(`
        UPDATE statuses
        SET status = ?
        WHERE id = ?
    `, [newStatues, id])

    return getStatus(id);
}

export async function changeStatusName(id, newStatus) { // done
    const [rows] = await pool.query(`
        UPDATE statuses
        SET status = ?
        WHERE id = ?
    `, [newStatus, id])

    return {changed_count: rows.affectedRows};
}

export async function changeStatusId(id, newId) { // done
    const [rows] = await pool.query(`
        UPDATE statuses
        SET id = ?
        WHERE id = ?
    `, [newId, id])

    return {changed_count: rows.affectedRows};
}

// delete
export async function deleteStatus(id) { // done
    const [rows] = await pool.query(`
        DELETE FROM statuses
        WHERE id = ?
    `, [id])

    return {deleted_count: rows.affectedRows}
}
