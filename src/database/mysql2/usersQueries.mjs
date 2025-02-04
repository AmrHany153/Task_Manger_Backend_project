import pool from "./databaseConnection.mjs"

// -- Checking
export async function checkIfUserIdExists(id) {
    // (!!) to make it true or false  |  ([0][0]) to get the first record
    return !!(await pool.query(`SELECT id FROM users WHERE id = ?`, [id]))[0][0];
}

export async function checkIfUserNameExists(name) {
    return !!(await pool.query(`SELECT name FROM users WHERE name = ?`, [name]))[0][0];
}

export async function checkIfUserUsernameExists(username) {
    return !!(await pool.query(`SELECT username FROM users WHERE username = ?`, [username]))[0][0];
}


// create
export async function createRecord(name, username, password, created_at) {
    const user = await pool.query(`
        INSERT INTO users (name, username, password, created_at)
        VALUES (?, ?, ?, ?)
    
    `, [name, username, password, created_at])

    const id = user[0].insertId

    return getById(id);
}

// select
export async function getAll() { 
    const [rows] = await pool.query(`
        SELECT * 
        FROM users
    `)

    return rows;
}

async function getUserBy(columnName, value) { 
    const [user] = await pool.query(`
        SELECT * 
        FROM users
        WHERE ${columnName} = ?    
    `, [value])

    return user[0];
}

export async function getById(id) { 
    return getUserBy("id", id)
}

export async function getByName(name){ 
    return getUserBy("name", name)
}
        
export async function getByUsername(username){ 
    return getUserBy("username", username)
}


// update
export async function changeRecord(id, name, username, password) { 
    await pool.query(`
        UPDATE users
        SET name = ?,
            username = ?,
            password = ?
        WHERE id = ?
    `, [name, username, password, id]);
}

async function changeUser(id, columnName, newValue) { 
    await pool.query(`
        UPDATE users
        SET ${columnName} = ?
        WHERE id = ?
    `, [newValue, id]);
}

export async function changeName(id, name) { 
    changeUser(id, "name", name);
}

export async function changeUsername(id, username) { 
    changeUser(id, "username", username);
}

export async function changePassword(id, password) { 
    changeUser(id, "password", password);
}

export async function changeIsAdmin(id, isAdmin) { 
    changeUser(id, "is_admin", isAdmin);
}

export async function changeCreatedAt(id, created_at) { 
    changeUser(id, "created_at", created_at);
}


// delete
async function deleteUserBy(columnName, value) { 
    const [rows] = await pool.query(`
        DELETE FROM users 
        WHERE ${columnName} = ?
    `, [value])

    return rows.affectedRows;
}

export async function deleteById(id) { 
    return deleteUserBy("id", id);
}

export async function deleteByName(name) { 
    return deleteUserBy("name", name);
}

export async function deleteByUsername(username) { 
    return deleteUserBy("username", username);
}