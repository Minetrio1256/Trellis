import { query } from "../config/db.js";


export async function findUser(id) {
    const rows = await query(
        "SELECT * FROM users WHERE id = ?",
        [id]
    );

    return rows[0];
}


export async function saveSession(
    id,
    jwt,
    expire,
    oauth
) {
    await query(
        `
            INSERT INTO users(
                id,
                jwt,
                jwt_expire,
                discord_access_token,
                discord_refresh_token
            )
            VALUES (?, ?, ?, ?, ?)

                ON DUPLICATE KEY UPDATE

                                     jwt = VALUES(jwt),
                                     jwt_expire = VALUES(jwt_expire),
                                     discord_access_token = VALUES(discord_access_token),
                                     discord_refresh_token = VALUES(discord_refresh_token)

        `,
        [
            id,
            jwt,
            expire,
            oauth.access_token,
            oauth.refresh_token
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