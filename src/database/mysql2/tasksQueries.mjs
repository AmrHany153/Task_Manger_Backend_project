import pool from "./databaseConnection.mjs";


// -- checking
export async function checkIfTaskIdExists(id) {
    // (!!) to make it true or false  |  ([0][0]) to get the first record
    return !!(await pool.query(`SELECT id FROM tasks WHERE id = ?`, [id]))[0][0];
}
export async function checkIfTaskTitleExists(title) {
    return !!(await pool.query(`SELECT title FROM tasks WHERE title = ?`, [title]))[0][0];
}


// -- create
export async function createRecord(
    title,
    user_id,
    status_id,
    group_id,
    description,
    created_at
) {
    const task = await pool.query(`
        INSERT INTO tasks (title, user_id, status_id, group_id, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `,[title, user_id, status_id, group_id, description, created_at]
    );

    const id = task[0].insertId;

    return get(id);
}


// -- select | used in 8 ways | note: if i built it by separated functions way the names will be too long and confusing => getByUserIdAndStatusIdAndGroupId()
export async function get(id, user_id, status_id, group_id) {
    let body = `
        SELECT 
            t.id,
            t.title,
            t.user_id,
            u.name AS owner,
            t.status_id,
            ${group_id ? "t."+group_id : ""} 
            s.status,
            t.description,
			t.created_at
                
        FROM task_manger.tasks t
        
        JOIN task_manger.users u
            ON t.user_id = u.id
            
        JOIN task_manger.statuses s
            ON  t.status_id = s.id
        `;

    const parameters = [];

    // get by id
    // note: by id means there is only one task so i added return and [0] to make it only one task 
    if (id) {
        return (await pool.query(body + "WHERE t.id = ?", [id]))[0][0];
    }

    // get by user_id
    if (user_id && !status_id && !group_id) {
        body += "WHERE t.user_id = ?"; 
        parameters.push(user_id);
    }

    // get by status_id
    else if (!user_id && status_id && !group_id) {
        body += "WHERE t.status_id = ?";
        parameters.push(status_id);
    }

    // get by group_id
    else if (!user_id && !status_id && group_id) {
        body += "WHERE t.group_id = ?";
        parameters.push(group_id);
    }

    // get by user_id and status_id
    else if (user_id && status_id && !group_id) {
        body += "WHERE t.user_id = ? AND t.status_id = ?";
        parameters.push(user_id);
        parameters.push(status_id);
    }

    // get by user_id and group_id
    else if (user_id && !status_id && group_id) {
        body += "WHERE t.user_id = ? AND t.group_id = ?";
        parameters.push(user_id);
        parameters.push(group_id);
    }

    // get by status_id and group_id
    else if (!user_id && status_id && group_id) {
        body += "WHERE t.status_id = ? AND t.group_id = ?";
        parameters.push(status_id);
        parameters.push(group_id);
    }

    // get by user_id and status_id and group_id
    else if (user_id && status_id && group_id) {
        body += "WHERE t.user_id = ? AND t.status_id = ? AND t.group_id = ?";
        parameters.push(user_id);
        parameters.push(status_id);
        parameters.push(group_id);
    }

    // note: if all params are undefined all tasks will be returned
    return (await pool.query(body, parameters))[0];
}



// -- update
// for put method 
export async function changeRecord(id, title, user_id, status_id, description, created_at) {
     await pool.query(`
        UPDATE tasks
        SET title = ?,
            user_id = ?,
            status_id = ?,
            description = ?,
            created_at = ?,
        
        WHERE id = ?
        `, [title, user_id, status_id, description, created_at, id]);
}

// for patch method 
async function changeTask(id, columnName, newValue) {
    await pool.query(`
        UPDATE tasks
        SET ${columnName} = ?
        WHERE id = ? 
    `, [newValue, id]
    );
}

export async function changeTitle(id, newTitle) {
    return changeTask(id, "title", newTitle);
}

export async function changeUserId(id, newUserId) {
    return changeTask(id, "user_id", newUserId);
}

export async function changeStatusId(id, newStatusId) {
    return changeTask(id, "status_id", newStatusId);
}

export async function changeGroupId(id, newGroupId) {
    return changeTask(id, "group_id", newGroupId);
}

export async function changeDescription(id, newDescription) {
    return changeTask(id, "description", newDescription);
}

export async function changeCreatedAt(id, newDate) {
    return changeTask(id, "created_at", newDate);
}


// -- delete
export async function deleteById(id) {
    const [rows] = await pool.query(`
        DELETE FROM tasks 
        WHERE id = ?
    `, [id]
    );

    return rows.affectedRows ;
}

export async function deleteByGroup_id(group_id) {
    const [rows] = await pool.query(`
        DELETE FROM tasks 
        WHERE group_id = ?
    `, [group_id]
    );

    return rows.affectedRows ;
}


// == foreign keys stuff
export async function getTasksIdsByStatusId(status_id) {
    let tasks = await get(undefined, undefined, status_id);
    for (let i = 0;i < tasks.length; ++i) {
        // convert every task to its status_id
        tasks[i] = tasks[i].status_id;
    }
    return (tasks.length > 0) ? tasks : undefined; 
} 