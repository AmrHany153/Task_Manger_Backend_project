import { Router } from "express";

import authRoutes from "./auth.mjs"
import usersRoutes from "./usersRoutes.mjs";
import tasksRoutes from "./tasksRoutes.mjs";
import groupsRoutes from "./groupsRoutes.mjs"
import statusesRoutes from "./statusesRoutes.mjs";

const router = Router();

router.use("/auth", authRoutes)
router.use("/users", usersRoutes);
router.use("/tasks", tasksRoutes)
router.use("/groups", groupsRoutes)
router.use("/statuses", statusesRoutes);

export default router;

