import Permission from "../permissions.js";
import { getUserPermissions } from "./globalGroup.js";

/**
 * Get the current permissions for a user from the database.
 */
export async function getPermissions(user) {
    if (!user?.id) {
        console.log("❌ getPermissions: missing user.id", user);
        return [];
    }

    const permissions = await getUserPermissions(user.id);

    console.log("🔐 Loaded permissions:", {
        userId: user.id,
        permissions
    });

    return permissions;
}

/**
 * Checks if a user has a global permission.
 *
 * Administrator always succeeds.
 */
export async function hasPermission(user, permission) {
    if (!user?.id) {
        console.log("❌ Permission denied: no user.id", user);
        return false;
    }

    const permissions = await getPermissions(user);

    console.log("🔐 Permission check:", {
        userId: user.id,
        requiredPermission: permission,
        permissions,
        administratorPermission: Permission.ADMINISTRATOR,
        isAdministrator: permissions.includes(
            Permission.ADMINISTRATOR
        )
    });

    if (
        permissions.includes(
            Permission.ADMINISTRATOR
        )
    ) {
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

    const userPermissions =
        await getPermissions(user);

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

    const userPermissions =
        await getPermissions(user);

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
            console.log("🛡️ Checking permission:", {
                path: req.path,
                method: req.method,
                user: req.user,
                requiredPermission
            });

            const allowed =
                await hasPermission(
                    req.user,
                    requiredPermission
                );

            if (!allowed) {
                console.log(
                    "❌ Permission denied:",
                    {
                        userId: req.user?.id,
                        requiredPermission
                    }
                );

                return res.sendStatus(403);
            }

            console.log(
                "✅ Permission granted:",
                {
                    userId: req.user?.id,
                    requiredPermission
                }
            );

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