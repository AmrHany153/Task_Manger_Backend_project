/* eslint-disable no-undef */
import fs from "fs";
import https from "https";

// environment variables
import dotenv from "dotenv"
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import routes from "./routes/index.mjs";

// strategies  
import "./strategies/local-strategy.mjs";

// middlewares
import { setRole } from "./utils/middlewares/setRole.mjs";


const options = {
    key: fs.readFileSync("./ssl/key.pem"),
    cert: fs.readFileSync("./ssl/cert.pem")
}


const app = express();


mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("connected to MongoDB"))
    .catch((err) => console.log("Error:", err));


app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60_000 * 60,
    },
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(setRole);

app.use("/api", routes);


app.get("/", async (req, res) => {
    res.status(200).send("Welcome");
})


app.use((err, req, res) => {
    res.status(500).json({
        message: err.message,
    });
    console.error(err.stack);
});

const PORT = process.env.PORT || 3000;
https.createServer(options, app).listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
});
