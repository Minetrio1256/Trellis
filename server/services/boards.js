import { query } from "../config/db.js";

/*
 * Boards
 */

export async function getBoards() {
    return await query(`
        SELECT *
        FROM kanban_boards
        ORDER BY name
    `);
}

export async function getBoardByUUID(uuid) {
    const rows = await query(`
        SELECT *
        FROM kanban_boards
        WHERE uuid = ?
    `, [uuid]);

    return rows[0];
}

export async function createBoard(
    uuid,
    name,
    description,
    createdBy
) {
    await query(`
        INSERT INTO kanban_boards (
            uuid,
            name,
            description,
            created_by
        )
        VALUES (?, ?, ?, ?)
    `, [
        uuid,
        name,
        description,
        createdBy
    ]);
}

export async function updateBoard(
    uuid,
    name,
    description
) {
    await query(`
        UPDATE kanban_boards
        SET
            name = ?,
            description = ?
        WHERE uuid = ?
    `, [
        name,
        description,
        uuid
    ]);
}

export async function deleteBoard(uuid) {
    await query(`
        DELETE FROM kanban_boards
        WHERE uuid = ?
    `, [uuid]);
}

/*
 * Board Groups
 */

export async function getBoardGroups(boardUUID) {
    return await query(`
        SELECT *
        FROM board_groups
        WHERE board_uuid = ?
        ORDER BY name
    `, [boardUUID]);
}

export async function getBoardGroup(uuid) {
    const rows = await query(`
        SELECT *
        FROM board_groups
        WHERE uuid = ?
    `, [uuid]);

    return rows[0];
}

export async function createBoardGroup(
    uuid,
    boardUUID,
    name,
    description,
    permissions = []
) {
    await query(`
        INSERT INTO board_groups (
            uuid,
            board_uuid,
            name,
            description,
            permissions
        )
        VALUES (?, ?, ?, ?, ?)
    `, [
        uuid,
        boardUUID,
        name,
        description,
        JSON.stringify(permissions)
    ]);
}

export async function updateBoardGroup(
    uuid,
    name,
    description,
    permissions
) {
    await query(`
        UPDATE board_groups
        SET
            name = ?,
            description = ?,
            permissions = ?
        WHERE uuid = ?
    `, [
        name,
        description,
        JSON.stringify(permissions),
        uuid
    ]);
}

export async function deleteBoardGroup(uuid) {
    await query(`
        DELETE FROM board_groups
        WHERE uuid = ?
    `, [uuid]);
}

/*
 * Members
 */

export async function getBoardMembers(groupUUID) {
    return await query(`
        SELECT user_id
        FROM board_group_members
        WHERE board_group_uuid = ?
    `, [groupUUID]);
}

export async function addBoardMember(userId, groupUUID) {
    await query(`
        INSERT IGNORE INTO board_group_members (
            user_id,
            board_group_uuid
        )
        VALUES (?, ?)
    `, [
        userId,
        groupUUID
    ]);
}

export async function removeBoardMember(userId, groupUUID) {
    await query(`
        DELETE FROM board_group_members
        WHERE user_id = ?
          AND board_group_uuid = ?
    `, [
        userId,
        groupUUID
    ]);
}

export async function clearBoardMembers(groupUUID) {
    await query(`
        DELETE FROM board_group_members
        WHERE board_group_uuid = ?
    `, [groupUUID]);
}

export async function getBoardPermissions(userId, boardUUID) {

    const groups = await query(`
        SELECT bg.permissions
        FROM board_group_members bgm
        JOIN board_groups bg
            ON bg.uuid = bgm.board_group_uuid
        WHERE bgm.user_id = ?
          AND bg.board_uuid = ?
    `, [
        userId,
        boardUUID
    ]);

    const permissions = new Set();

    for (const group of groups) {

        const perms = JSON.parse(group.permissions);

        for (const permission of perms) {
            permissions.add(permission);
        }

    }

    return [...permissions];
}

export async function getAccessibleBoard(userId, uuid) {
    const board = await getBoardByUUID(uuid);
    if (!board) return null;

    const permissions = await getBoardPermissions(userId, uuid);
    // Adjust permission logic depending on how your app handles ownership/access
    return { ...board, permissions };
}

export async function getAccessibleBoards(userId) {
    const boards = await getBoards();
    const accessibleBoards = [];

    for (const board of boards) {
        const permissions = await getBoardPermissions(userId, board.uuid);
        // If the user has any permissions or access to the board, include it
        if (permissions && permissions.length > 0) {
            accessibleBoards.push({ ...board, permissions });
        }
    }

    return accessibleBoards;
}

export async function getBoardGroupsForUser(userId, boardUUID) {
    const board = await getAccessibleBoard(userId, boardUUID);
    if (!board) return null;

    return await getBoardGroups(boardUUID);
}