import {Router} from "express";

import usersRoutes from "./usersRoutes.mjs";
import tasksRoutes from "./tasksRoutes.mjs";
import statusesRoutes from "./statusesRoutes.mjs";

const router = Router();

router.use("/users", usersRoutes);
router.use("/tasks", tasksRoutes)
router.use("/statuses", statusesRoutes);

export default router;