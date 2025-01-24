import { Router } from "express";
import asyncHandler from "express-async-handler";
import { matchedData } from "express-validator";
import { tasksSchemas } from "../utils/validators/index.mjs"

// database
import db from "../database/index.mjs";

// middlewares
import { validationErrorHandler } from "../utils/middlewares/validationErrorHandler.mjs"



const router = Router();


// -- create task
router.post("/", /*validator!*/ validationErrorHandler, asyncHandler(async (req, res) => {
    const { title, user_id, status_id, description } = req.body// matchedData(req);
    let { created_at } = req.body//matchedData(req);

    created_at = created_at || new Date().toISOString().split('T')[0];
    
    const newTask = await db.createTask(title, user_id, status_id, description, created_at)

    res.status(200).send(newTask);
}))



// -- get task
// get {all, user_id, status_id, user_id && status_id}
router.get("/", tasksSchemas.get, validationErrorHandler, asyncHandler(async (req, res) => {
    const {user_id, status_id} = matchedData(req, {locations: ["query"]});

    let tasks;

    if (user_id || status_id) {
        tasks = await db.getTasks(undefined, user_id, status_id);
    } else {
        // if all are undefined will return all tasks, I make them all undefined by default  
        tasks = await db.getTasks();
    }
    
    res.status(200).send(tasks);
}))

// get by id
router.get("/task/:id", tasksSchemas.get, validationErrorHandler, asyncHandler(async (req, res) => {
    const {id} = req.params;// matchedData(req);
    const task = await db.getTasks(id);

    if (!task) res.sendStatus(404)

    res.status(200).send(task);
}))



// -- update task
router.put("/:id", asyncHandler(async (req, res) => { // title user_id status_id description created_at 
    const { id } = req.params; // matchedData(req, {locations: ["params"]});
    const { title, user_id, status_id, description, created_at } = req.body // matchedData(req, {locations: ["body"]});
    const userData = await db.changeTaskRecord(id, title, user_id, status_id, description, created_at);

    res.status(200).send(userData);
}));

router.patch("/:id", asyncHandler(async (req, res) => {
    const {id} = req.params // matchedData(req, {locations: ["params"]});
    const data = req.body // matchedData(req, {locations: ["body"]});
    
    // to return it with the changes
    let taskBody = await db.getTasks(id);
    taskBody.changed = [];

    for (const column in data) { 
        switch (column) {
            case "title":
                await db.changeTaskTitle(id, data.title);
                taskBody.title = data.title;
                taskBody.changed.push(column);
                break;

            case "user_id":
                await db.changeTaskUserId(id, data.user_id);
                taskBody.user_id = data.user_id;
                taskBody.changed.push(column);
                break;

            case "status_id":
                await db.changeTaskStatusId(id, data.status_id);
                taskBody.status_id = data.status_id;
                taskBody.changed.push(column);
                break;

            case "description":
                await db.changeTaskDescription(id, data.description);
                taskBody.description = data.description;
                taskBody.changed.push(column);
                break;

            case "created_at":
                await db.changeTaskCreatedAt(id, data.created_at);
                taskBody.created_at = data.created_at;
                taskBody.changed.push(column);
                break;
        }
    }

    res.status(200).send(taskBody);
}));


// -- delete task
router.delete("/:id", asyncHandler(async (req, res) => {
    const { id } = req.params // matchedData(req, {locations: ["params"]});
    const isDeleted = await db.deleteTaskById(id);

    if (isDeleted) {
        res.status(200).send({message: "Record successfully deleted"});
    } else {
        res.status(404).send({message: `Record Not found`})
    }
}))


// TODO 3: searching on a task


export default router;