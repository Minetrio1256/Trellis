import * as Permission from "../permissions.js";
import { query } from "../config/db.js";

/**
 * Safely parse a group's permissions JSON.
 *
 * Expected database format:
 *
 * [
 *   "administrator",
 *   "board.create",
 *   "board.delete"
 * ]
 */
function parsePermissions(value) {
    if (!value) {
        return [];
    }

    try {
        const parsed = typeof value === "string"
            ? JSON.parse(value)
            : value;

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed;
    } catch (error) {
        console.error("Failed to parse permissions:", error);
        return [];
    }
}

/**
 * Get all global permissions for a user from the database.
 */
export async function getUserPermissions(userId) {
    if (!userId) {
        return [];
    }

    const rows = await query(`
        SELECT gg.permissions
        FROM user_groups ug
        INNER JOIN global_groups gg
            ON gg.uuid = ug.group_uuid
        WHERE ug.user_id = ?
    `, [userId]);

    const permissions = new Set();

    for (const row of rows) {
        for (const permission of parsePermissions(row.permissions)) {
            permissions.add(permission);
        }
    }

    return [...permissions];
}

/**
 * Get all permissions a user has on a specific board.
 *
 * This includes:
 *
 * 1. Global group permissions
 * 2. Board group permissions
 */
export async function getBoardPermissions(userId, boardUuid) {
    if (!userId || !boardUuid) {
        return [];
    }

    const rows = await query(`
        SELECT permissions
        FROM (
            SELECT gg.permissions
            FROM user_groups ug
            INNER JOIN global_groups gg
                ON gg.uuid = ug.group_uuid
            WHERE ug.user_id = ?

            UNION ALL

            SELECT bg.permissions
            FROM board_group_members bgm
            INNER JOIN board_groups bg
                ON bg.uuid = bgm.board_group_uuid
            WHERE bgm.user_id = ?
              AND bg.board_uuid = ?
        ) AS permission_groups
    `, [userId, userId, boardUuid]);

    const permissions = new Set();

    for (const row of rows) {
        for (const permission of parsePermissions(row.permissions)) {
            permissions.add(permission);
        }
    }

    return [...permissions];
}

/**
 * Checks if a user has a global permission.
 *
 * Administrator always succeeds.
 */
export async function hasPermission(user, permission) {
    if (!user) {
        return false;
    }

    const permissions = await getUserPermissions(user.id);

    if (permissions.includes(Permission.ADMINISTRATOR)) {
        return true;
    }

    return permissions.includes(permission);
}

/**
 * Checks if the user has every permission.
 *
 * Administrator always succeeds.
 */
export async function hasPermissions(user, requiredPermissions) {
    if (!user) {
        return false;
    }

    const permissions = await getUserPermissions(user.id);

    if (permissions.includes(Permission.ADMINISTRATOR)) {
        return true;
    }

    return requiredPermissions.every(permission =>
        permissions.includes(permission)
    );
}

/**
 * Checks if the user has at least one permission.
 *
 * Administrator always succeeds.
 */
export async function hasAnyPermission(user, requiredPermissions) {
    if (!user) {
        return false;
    }

    const permissions = await getUserPermissions(user.id);

    if (permissions.includes(Permission.ADMINISTRATOR)) {
        return true;
    }

    return requiredPermissions.some(permission =>
        permissions.includes(permission)
    );
}

/**
 * Checks permissions on a specific board.
 *
 * Global permissions + board-specific permissions.
 *
 * Administrator always succeeds.
 */
export async function hasBoardPermission(
    user,
    boardUuid,
    permission
) {
    if (!user) {
        return false;
    }

    const permissions = await getBoardPermissions(
        user.id,
        boardUuid
    );

    if (permissions.includes(Permission.ADMINISTRATOR)) {
        return true;
    }

    return permissions.includes(permission);
}

/**
 * Global permission middleware.
 */
export function permission(requiredPermission) {
    return async (req, res, next) => {
        try {
            console.log("========== PERMISSION DEBUG ==========");
            console.log("req.user:", req.user);
            console.log("req.user.id:", req.user?.id);
            console.log("requiredPermission:", requiredPermission);
            console.log("Permission.ADMINISTRATOR:", Permission.ADMINISTRATOR);

            const permissions = await getUserPermissions(req.user?.id);

            console.log("DB permissions:", permissions);
            console.log(
                "is administrator:",
                permissions.includes(Permission.ADMINISTRATOR)
            );
            console.log(
                "has required permission:",
                permissions.includes(requiredPermission)
            );
            console.log("=======================================");

            if (!req.user) {
                return res.sendStatus(401);
            }

            if (permissions.includes(Permission.ADMINISTRATOR)) {
                return next();
            }

            if (!permissions.includes(requiredPermission)) {
                return res.sendStatus(403);
            }

            next();

        } catch (error) {
            console.error("Permission check failed:", error);
            return res.sendStatus(500);
        }
    };
}

/**
 * Board permission middleware.
 *
 * Expects the board UUID to be in:
 *
 * req.params.boardUuid
 */
export function boardPermission(requiredPermission) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.sendStatus(401);
            }

            const boardUuid = req.params.boardUuid;

            if (!boardUuid) {
                return res.sendStatus(400);
            }

            const allowed = await hasBoardPermission(
                req.user,
                boardUuid,
                requiredPermission
            );

            if (!allowed) {
                return res.sendStatus(403);
            }

            next();
        } catch (error) {
            console.error("Board permission check failed:", error);
            return res.sendStatus(500);
        }
    };
}