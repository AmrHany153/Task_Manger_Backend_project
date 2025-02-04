import { Router } from "express";
import asyncHandler from "express-async-handler";
import { matchedData } from "express-validator";
import { tasksSchemas } from "../utils/validators/index.mjs";

// database
import { mysql } from "../database/index.mjs";

// middlewares
import { validationErrorHandler } from "../utils/middlewares/validationErrorHandler.mjs"
import { requireAuth } from "../utils/middlewares/requireAuth.mjs";
import { requireAdmin } from "../utils/middlewares/requireAdmin.mjs";


const router = Router();

// -- create task
router.post("/", requireAuth, tasksSchemas.post, validationErrorHandler, asyncHandler(async (req, res) => {
    const { title, status_id, description } = matchedData(req, {locations: ["body"]});
    const { group_id } = matchedData(req, {locations: ["query"]});
    const { id: user_id } = req.user;

    const created_at = new Date().toISOString().split('T')[0];

    const newTask = await mysql.tasks.createRecord(title, user_id, status_id, group_id, description, created_at)

    res.status(200).send(newTask);
}))



// -- get task
// get by { user_id, status_id, user_id & status_id, all }
router.get("/", requireAdmin, tasksSchemas.get, validationErrorHandler, asyncHandler(async (req, res) => {
    const { user_id, status_id, group_id, } = matchedData(req, { locations: ["query"] });

    let tasks;

    if (user_id || status_id) {
        tasks = await mysql.tasks.get(undefined, user_id, status_id, group_id);
    } else {
        // if all are undefined will return all tasks, I make them all undefined by default  
        tasks = await mysql.tasks.get();
    }

    res.status(200).send(tasks);
}))


router.get("/me", requireAuth, tasksSchemas.get, validationErrorHandler, asyncHandler(async (req, res) => {
    const { id: user_id } = req.user;
    const { status_id } = matchedData(req, { locations: ["query"] });

    let tasks = await mysql.tasks.get(undefined, user_id, status_id);
    
    res.status(200).send(tasks);
}))


// get by id
router.get("/:id", requireAdmin, tasksSchemas.get, validationErrorHandler, asyncHandler(async (req, res) => {
    const { id } = matchedData(req, { locations: ["param"] });
    const task = await mysql.tasks.get(id);

    if (!task) res.sendStatus(404)

    res.status(200).send(task);
}))


// -- update task
router.put("/me", requireAuth, tasksSchemas.put, validationErrorHandler, asyncHandler(async (req, res) => { // title user_id status_id description created_at 
    const { id } = req.user;
    const { title, user_id, status_id, description, created_at } = matchedData(req, { locations: ["body"] });
    const userData = await mysql.tasks.changeRecord(id, title, user_id, status_id, description, created_at);

    res.status(200).send(userData);
}));


router.patch("/:id", requireAdmin, tasksSchemas.patch, validationErrorHandler, asyncHandler(async (req, res) => {
    const { id } = matchedData(req, { locations: ["params"] });
    const data = matchedData(req, { locations: ["body"] });

    // to return it with the changes
    let taskBody = await mysql.tasks.get(id);
    taskBody.changed = [];

    for (const column in data) {
        switch (column) {
            case "title":
                await mysql.tasks.changeTitle(id, data.title);
                taskBody.title = data.title;
                taskBody.changed.push(column);
                break;

            case "user_id":
                await mysql.tasks.changeUserId(id, data.user_id);
                taskBody.user_id = data.user_id;
                taskBody.changed.push(column);
                break;

            case "status_id":
                await mysql.tasks.changeStatusId(id, data.status_id);
                taskBody.status_id = data.status_id;
                taskBody.changed.push(column);
                break;

            case "group_id":
                await mysql.tasks.changeGroupId(id, data.group_id);
                taskBody.group_id = data.group_id;
                taskBody.changed.push(column);
                break;

            case "description":
                await mysql.tasks.changeDescription(id, data.description);
                taskBody.description = data.description;
                taskBody.changed.push(column);
                break;

            case "created_at":
                await mysql.tasks.changeCreatedAt(id, data.created_at);
                taskBody.created_at = data.created_at;
                taskBody.changed.push(column);
                break;
        }
    }

    res.status(200).send(taskBody);
}));



// -- delete task
router.delete("/:id", requireAuth, tasksSchemas.delete, validationErrorHandler, asyncHandler(async (req, res) => {
    const { id } = matchedData(req, { locations: ["params"] });
    const userId = req.user.id;
    const userRole = req.user.role;

    const task = await mysql.tasks.getTaskById(id);

    if (!task) {
        return res.status(404).send({ message: "Record not found" });
    }

    // checking role
    if (userRole !== 'admin' && task.userId !== userId) {
        return res.status(403).send({ message: "Forbidden: Insufficient permissions" });
    }

    // works if you are admin or want to delete one of your tasks
    const isDeleted = await mysql.tasks.deleteTaskById(id);

    if (isDeleted) {
        res.status(200).send({ message: "Record successfully deleted" });
    } else {
        res.status(404).send({ message: "Field to delete the record" });
    }
}));


export default router;