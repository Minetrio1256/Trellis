import Permission from "../permissions.js";

import {
    getUserPermissions
} from "./globalGroup.js";

import { query } from "../config/db.js";

/*
 * Global Permissions
 */

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

/*
 * Board Permissions
 */

/**
 * Gets all permissions a user has on a specific board.
 *
 * Includes:
 *
 * - Global group permissions
 * - Board group permissions
 */
export async function getBoardPermissions(userId, boardUuid) {
    if (!userId || !boardUuid) {
        return [];
    }

    const globalPermissions = await getUserPermissions(userId);

    const boardGroups = await query(`
        SELECT bg.permissions
        FROM board_group_members bgm
        INNER JOIN board_groups bg
            ON bg.uuid = bgm.board_group_uuid
        WHERE bgm.user_id = ?
          AND bg.board_uuid = ?
    `, [
        userId,
        boardUuid
    ]);

    const permissions = new Set(globalPermissions);

    for (const group of boardGroups) {
        const groupPermissions = Array.isArray(group.permissions)
            ? group.permissions
            : JSON.parse(group.permissions);

        for (const permission of groupPermissions) {
            permissions.add(permission);
        }
    }

    return [...permissions];
}

/**
 * Checks permissions on a specific board.
 *
 * Global permissions extend to board permissions.
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

/*
 * Middleware
 */

/**
 * Global permission middleware.
 *
 * Usage:
 *
 * router.get(
 *     "/users",
 *     auth,
 *     permission(Permission.USER_VIEW),
 *     handler
 * );
 */
export function permission(requiredPermission) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.sendStatus(401);
            }

            const allowed = await hasPermission(
                req.user,
                requiredPermission
            );

            if (!allowed) {
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
 * Expects:
 *
 * /boards/:boardUuid/...
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
            console.error(
                "Board permission check failed:",
                error
            );

            return res.sendStatus(500);
        }
    };
}