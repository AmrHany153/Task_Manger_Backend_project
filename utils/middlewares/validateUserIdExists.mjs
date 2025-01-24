import {checkIfUserIdExists} from "../../database/usersQueries.mjs";

export const validateUserIdExists = async (req, res, next) => {
    const {id} = req.params;
    const [[isIdExists]] = await checkIfUserIdExists(id)

    if (isIdExists) {
        next();
    } else res.sendStatus(404);
}