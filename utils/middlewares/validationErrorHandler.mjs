import {validationResult} from "express-validator";

export const validationErrorHandler = (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).send(result.array());
    }
    next();
}
