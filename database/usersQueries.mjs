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
export async function createUser(name, username, password, created_at) { // done
    const user = await pool.query(`
        INSERT INTO users (id, name, username, password, created_at)
        VALUES (?, ?, ?, ?)
    
    `, [name, username, password, created_at])

    const id = user[0].insertId

    return getUserById(id);
}

// select
export async function getUsers() { // done
    const [rows] = await pool.query(`
        SELECT * 
        FROM users
    `)

    return rows;
}

async function getUser(columnName, value) { // done
    const [user] = await pool.query(`
        SELECT * 
        FROM users
        WHERE ${columnName} = ?    
    `, [value])

    return user[0];
}

export async function getUserById(id) { // done
    return getUser("id", id)
}

export async function getUserByName(name){ // done
    return getUser("name", name)
}


// update
export async function changeUserRecord(id, name, username, password) { // done
    await pool.query(`
        UPDATE users
        SET name = ?,
            username = ?,
            password = ?
        WHERE id = ?
    `, [name, username, password, id]);
}

async function changeUser(id, columnName, newValue) { // done
    await pool.query(`
        UPDATE users
        SET ${columnName} = ?
        WHERE id = ?
    `, [newValue, id]);
}

export async function changeUserName(id, name) { // done
    changeUser(id, "name", name);
}

export async function changeUserUsername(id, username) { // done
    changeUser(id, "username", username);
}

export async function changeUserPassword(id, password) { // done
    changeUser(id, "password", password);
}

export async function changeUserCreatedAt(id, created_at) { // done
    changeUser(id, "created_at", created_at);
}


// delete
async function deleteUser(columnName, value) { // done
    const [rows] = await pool.query(`
        DELETE FROM users 
        WHERE ${columnName} = ?
    `, [value])

    return rows.affectedRows;
}

export async function deleteUserById(id) { // done
    return deleteUser("id", id);
}

export async function deleteUserByName(name) { // done
    return deleteUser("name", name);
}

export async function deleteUserByUsername(username) { // done
    return deleteUser("username", username);
}