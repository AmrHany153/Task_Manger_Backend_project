import pool from "./databaseConnection.mjs";

// -- Checking
export async function checkIfGroupIdExists(id) {
    // (!!) to make it true or false  |  ([0][0]) to get the first record
    return !!(await pool.query(`SELECT id FROM groups WHERE id = ?`, [id]))[0][0];
}

export async function checkIfGroupNameExists(name) {
    return !!(await pool.query(`SELECT name FROM groups WHERE name = ?`, [name]))[0][0];
}



// -- create
export async function createRecord(
    name,
    owner,
    created_at
) {
    const group = await pool.query(`
        INSERT INTO groups (name, owner, created_at)
        VALUES (?, ?, ?)
    `,[name, owner, created_at]);

    const id = group[0].insertId;

    return getById(id); 
}

// -- select
export async function getAll() { 
    const [rows] = await pool.query(`
        SELECT * 
        FROM groups
    `)

    return rows;
}

export async function getById(id) { 
    const [rows] = await pool.query(`
        SELECT * 
        FROM groups
        WHERE id = ?
    `, [id])

    return rows[0];
}

export async function getOwnerById(id) { 
    const [rows] = await pool.query(`
        SELECT owner 
        FROM groups
        WHERE id = ?
    `, [id])

    return rows[0]["owner"];
}


// -- update
export async function changeName(id, newName) {
    const [rows] = await pool.query(`
        UPDATE groups
        SET name = ?
        WHERE id = ?
    `, [newName, id])

    return rows.affectedRows;
}


export async function changeCreatedAt(id, newCreatedAt) {
    const [rows] = await pool.query(`
        UPDATE groups
        SET created_at = ?
        WHERE id = ?
    `, [newCreatedAt, id])

    return rows.affectedRows;
}


// -- delete
export async function deleteById(id) {
    const [rows] = await pool.query(`
        DELETE FROM statuses
        WHERE id = ?
    `, [id])

    return rows.affectedRows;
}