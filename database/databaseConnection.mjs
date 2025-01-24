import dotenv from "dotenv"
dotenv.config(); // {path:"../.env"}

import mysql from "mysql2"
import express from "express";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
}).promise();


export default pool;

// TODO 3: passport
