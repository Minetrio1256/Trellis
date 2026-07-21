import mariadb from "mariadb";
import env from "./env.js";

const pool = mariadb.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    connectionLimit: 5,
    acquireTimeout: 10000,
    idleTimeout: 30000
});

export async function query(sql, params = []) {
    let conn;

    try {
        conn = await pool.getConnection();
        return await conn.query(sql, params);
    } finally {
        if (conn) conn.release();
    }
}

export async function closePool() {
    await pool.end();
}

export default pool;