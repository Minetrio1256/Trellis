import { query } from "../config/db.js";

/*
 * Global Groups
 */

export async function getAllGroups() {
    return await query(`
        SELECT *
        FROM global_groups
        ORDER BY name
    `);
}

export async function getGroupByUUID(uuid) {
    const rows = await query(`
        SELECT *
        FROM global_groups
        WHERE uuid = ?
    `, [uuid]);

    return rows[0];
}

export async function getGroupByName(name) {
    const rows = await query(`
        SELECT *
        FROM global_groups
        WHERE name = ?
    `, [name]);

    return rows[0];
}

export async function getGroupByDiscordRole(roleId) {
    const rows = await query(`
        SELECT *
        FROM global_groups
        WHERE discord_role_id = ?
    `, [roleId]);

    return rows[0];
}

export async function createGroup(
    uuid,
    name,
    description,
    permissions = [],
    discordRoleId = null
) {
    await query(`
        INSERT INTO global_groups (
            uuid,
            name,
            description,
            permissions,
            discord_role_id
        )
        VALUES (?, ?, ?, ?, ?)
    `, [
        uuid,
        name,
        description,
        JSON.stringify(permissions),
        discordRoleId
    ]);
}

export async function updateGroup(
    uuid,
    name,
    description,
    permissions,
    discordRoleId
) {
    await query(`
        UPDATE global_groups
        SET
            name = ?,
            description = ?,
            permissions = ?,
            discord_role_id = ?
        WHERE uuid = ?
    `, [
        name,
        description,
        JSON.stringify(permissions),
        discordRoleId,
        uuid
    ]);
}

export async function deleteGroup(uuid) {
    await query(`
        DELETE FROM global_groups
        WHERE uuid = ?
    `, [uuid]);
}

/*
 * User Groups
 */

export async function getUserGroups(userId) {
    return await query(`
        SELECT gg.*
        FROM user_groups ug
        JOIN global_groups gg
            ON gg.uuid = ug.group_uuid
        WHERE ug.user_id = ?
        ORDER BY gg.name
    `, [userId]);
}

export async function addUserGroup(userId, groupUUID) {
    await query(`
        INSERT IGNORE INTO user_groups (
            user_id,
            group_uuid
        )
        VALUES (?, ?)
    `, [
        userId,
        groupUUID
    ]);
}

export async function removeUserGroup(userId, groupUUID) {
    await query(`
        DELETE FROM user_groups
        WHERE user_id = ?
          AND group_uuid = ?
    `, [
        userId,
        groupUUID
    ]);
}

export async function clearUserGroups(userId) {
    await query(`
        DELETE FROM user_groups
        WHERE user_id = ?
    `, [userId]);
}

export async function setUserGroups(userId, groupUUIDs) {
    await clearUserGroups(userId);

    for (const uuid of groupUUIDs) {
        await addUserGroup(userId, uuid);
    }
}

export async function getUserPermissions(userId) {

    const groups = await getUserGroups(userId);

    const permissions = new Set();

    for (const group of groups) {

        const perms = JSON.parse(group.permissions);

        for (const permission of perms) {
            permissions.add(permission);
        }

    }

    return [...permissions];
}

export async function syncDiscordRoles(userId, discordRoleIds) {

    const groups = [];

    for (const roleId of discordRoleIds) {

        const group = await getGroupByDiscordRole(roleId);

        if (group) {
            groups.push(group.uuid);
        }

    }

    await setUserGroups(userId, groups);
}