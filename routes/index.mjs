import {Router} from "express";

import usersRoutes from "./usersRoutes.mjs";
import tasksRoutes from "./tasksRoutes.mjs";
import statusesRoutes from "./statusesRoutes.mjs";

const router = Router();

router.use("/users", usersRoutes);
router.use("/tasks", tasksRoutes)
router.use("/statuses", statusesRoutes);

export default router;



// Testing Area
// import {usersSchemas} from "../utils/validators/index.mjs";
import {body, validationResult} from "express-validator";

router.patch("/test", [
    body("name")
    .isString().withMessage("must be string")
    .isLength({min:5, max:10}).withMessage("5 to 10")
    .custom((value, {req}) => {
        const errors = validationResult(req);
        if (errors) {
            console.log(errors.array());
            
        }
        
        return 1;
    })
    
    

], (req, res) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        res.status(400).send(result.array());
    }

    res.sendStatus(200);
})