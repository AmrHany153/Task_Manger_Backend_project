import express from 'express';
import passport from 'passport';
import { authSchema } from '../utils/validators/authSchemas.mjs';
import { validationErrorHandler } from '../utils/middlewares/validationErrorHandler.mjs';

const router = express.Router();


router.post("/login", authSchema.login, validationErrorHandler, passport.authenticate('local'), (req, res) => {
    res.sendStatus(201);
})

router.get("/status", (req, res) => {
    if (req.user) return res.send(req.user);
    res.sendStatus(401);
})

export default router;