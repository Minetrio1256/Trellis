import * as Permission from "../permissions.js";
import { getUserPermissions } from "./globalGroup.js";

/**
 * Get the current permissions for a user from the database.
 */
export async function getPermissions(user) {
    if (!user?.id) {
        return [];
    }

    return await getUserPermissions(user.id);
}

/**
 * Checks if a user has a global permission.
 *
 * Permissions are loaded from the database.
 * Administrator always succeeds.
 */
export async function hasPermission(user, permission) {

    if (!user?.id) {
        return false;
    }

    const permissions = await getPermissions(user);

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
export async function hasPermissions(user, permissions) {

    if (!user?.id) {
        return false;
    }

    const userPermissions = await getPermissions(user);

    if (
        userPermissions.includes(
            Permission.ADMINISTRATOR
        )
    ) {
        return true;
    }

    return permissions.every(
        permission =>
            userPermissions.includes(permission)
    );
}

/**
 * Checks if the user has at least one permission.
 *
 * Administrator always succeeds.
 */
export async function hasAnyPermission(user, permissions) {

    if (!user?.id) {
        return false;
    }

    const userPermissions = await getPermissions(user);

    if (
        userPermissions.includes(
            Permission.ADMINISTRATOR
        )
    ) {
        return true;
    }

    return permissions.some(
        permission =>
            userPermissions.includes(permission)
    );
}

/**
 * Checks permissions on a specific board.
 *
 * Global permissions and board permissions are combined.
 * Administrator always succeeds.
 */
export async function hasBoardPermission(
    user,
    boardPermissions = [],
    permission
) {

    if (!user?.id) {
        return false;
    }

    const userPermissions =
        await getPermissions(user);

    if (
        userPermissions.includes(
            Permission.ADMINISTRATOR
        )
    ) {
        return true;
    }

    return (
        userPermissions.includes(permission) ||
        boardPermissions.includes(permission)
    );
}

/**
 * Express permission middleware.
 */
export function permission(requiredPermission) {

    return async (req, res, next) => {

        try {

            const allowed =
                await hasPermission(
                    req.user,
                    requiredPermission
                );

            if (!allowed) {
                return res.sendStatus(403);
            }

            next();

        } catch (error) {

            console.error(
                "Permission check failed:",
                error
            );

            return res.sendStatus(500);
        }
    };
}