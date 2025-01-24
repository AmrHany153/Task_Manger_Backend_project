import dotenv from "dotenv";
dotenv.config();

import express from "express";
import routes from "./routes/index.mjs";

const app = express();

app.use(express.json());
app.use("/api", routes);

app.get("/", async (req, res) => {
    res.status(200).send("Welcome");
})

// eslint-disable-next-line no-undef
const PORT = process.env.PORT | 3000;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
});
