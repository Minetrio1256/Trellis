import { query } from "../config/db.js";


export async function findUser(id) {
    const rows = await query(
        "SELECT * FROM users WHERE id = ?",
        [id]
    );

    return rows[0];
}


export async function saveSession(id, token, expire) {
    await query(
        `
        INSERT INTO users(id, jwt, jwt_expire)
        VALUES (?, ?, ?)

        ON DUPLICATE KEY UPDATE
            jwt = VALUES(jwt),
            jwt_expire = VALUES(jwt_expire)
        `,
        [
            id,
            token,
            expire
        ]
    );
}


export async function clearSession(id) {
    await query(
        `
        UPDATE users
        SET jwt = NULL,
            jwt_expire = NULL
        WHERE id = ?
        `,
        [id]
    );
}