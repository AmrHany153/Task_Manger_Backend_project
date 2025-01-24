import * as usersQueries from "./usersQueries.mjs"
import * as tasksQueries from "./tasksQueries.mjs"
import * as statusesQueries from "./statusesQueries.mjs"


export default {
    ...usersQueries,
    ...tasksQueries,
    ...statusesQueries
}
