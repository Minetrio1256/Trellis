import * as Permission from "../permissions.js";

/**
 * Checks if a user has a global permission.
 * Administrator always succeeds.
 */
export function hasPermission(user, permission) {

    if (!user) {
        return false;
    }

    const permissions = user.permissions ?? [];

    if (permissions.includes(Permission.ADMINISTRATOR)) {
        return true;
    }

    return permissions.includes(permission);
}

/**
 * Checks if the user has every permission.
 * Administrator always succeeds.
 */
export function hasPermissions(user, permissions) {

    if (!user) {
        return false;
    }

    if (hasPermission(user, Permission.ADMINISTRATOR)) {
        return true;
    }

    return permissions.every(permission =>
        user.permissions.includes(permission)
    );
}

/**
 * Checks if the user has at least one permission.
 * Administrator always succeeds.
 */
export function hasAnyPermission(user, permissions) {

    if (!user) {
        return false;
    }

    if (hasPermission(user, Permission.ADMINISTRATOR)) {
        return true;
    }

    return permissions.some(permission =>
        user.permissions.includes(permission)
    );
}

/**
 * Checks permissions on a specific board.
 * Board permissions extend global permissions.
 * Administrator always succeeds.
 */
export function hasBoardPermission(
    user,
    boardPermissions,
    permission
) {

    if (!user) {
        return false;
    }

    if (hasPermission(user, Permission.ADMINISTRATOR)) {
        return true;
    }

    return (
        user.permissions.includes(permission) ||
        boardPermissions.includes(permission)
    );
}

export function permission(requiredPermission) {
    return async (req, res, next) => {
        if (!hasPermission(req.user, requiredPermission)) {
            return res.sendStatus(403);
        }
        next();
    };
}