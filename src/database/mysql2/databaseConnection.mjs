import dotenv from "dotenv"
dotenv.config();

import mysql from "mysql2"


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
}).promise();


export default pool;

