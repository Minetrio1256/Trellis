import { query } from "../config/db.js";

import Permission from "../permissions.js";

import {
    hasPermission,
    hasBoardPermission
} from "./permission.js";


/*
 * ============================================================
 * Boards
 * ============================================================
 */


/*
 * Get every board.
 *
 * This function intentionally does not perform
 * permission checks.
 *
 * Access control is handled by:
 *
 * getAccessibleBoards()
 * getAccessibleBoard()
 */

export async function getBoards() {

    return await query(`
        SELECT *
        FROM kanban_boards
        ORDER BY name
    `);

}


/*
 * Get a board by UUID.
 */

export async function getBoardByUUID(uuid) {

    const rows = await query(`
        SELECT *
        FROM kanban_boards
        WHERE uuid = ?
    `, [
        uuid
    ]);

    return rows[0];

}


/*
 * Create a board.
 */

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


/*
 * Update a board.
 */

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


/*
 * Delete a board.
 */

export async function deleteBoard(uuid) {

    await query(`
        DELETE FROM kanban_boards
        WHERE uuid = ?
    `, [
        uuid
    ]);

}


/*
 * ============================================================
 * Board Groups
 * ============================================================
 */


/*
 * Get all groups belonging to a board.
 */

export async function getBoardGroups(boardUUID) {

    return await query(`
        SELECT *
        FROM board_groups
        WHERE board_uuid = ?
        ORDER BY name
    `, [
        boardUUID
    ]);

}


/*
 * Get one board group by UUID.
 */

export async function getBoardGroup(uuid) {

    const rows = await query(`
        SELECT *
        FROM board_groups
        WHERE uuid = ?
    `, [
        uuid
    ]);

    return rows[0];

}


/*
 * Create a board group.
 */

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


/*
 * Update a board group.
 */

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


/*
 * Delete a board group.
 */

export async function deleteBoardGroup(uuid) {

    await query(`
        DELETE FROM board_groups
        WHERE uuid = ?
    `, [
        uuid
    ]);

}


/*
 * ============================================================
 * Board Group Members
 * ============================================================
 */


/*
 * Get members of a board group.
 */

export async function getBoardMembers(groupUUID) {

    return await query(`
        SELECT user_id
        FROM board_group_members
        WHERE board_group_uuid = ?
    `, [
        groupUUID
    ]);

}


/*
 * Add a user to a board group.
 */

export async function addBoardMember(
    userId,
    groupUUID
) {

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


/*
 * Remove a user from a board group.
 */

export async function removeBoardMember(
    userId,
    groupUUID
) {

    await query(`
        DELETE FROM board_group_members
        WHERE user_id = ?
          AND board_group_uuid = ?
    `, [
        userId,
        groupUUID
    ]);

}


/*
 * Remove every member from a board group.
 */

export async function clearBoardMembers(groupUUID) {

    await query(`
        DELETE FROM board_group_members
        WHERE board_group_uuid = ?
    `, [
        groupUUID
    ]);

}


/*
 * ============================================================
 * Board Permissions
 * ============================================================
 */


/*
 * Get permissions a user receives from groups
 * belonging to a specific board.
 *
 * Global permissions are handled separately by
 * services/permission.js.
 *
 * This function only returns permissions granted
 * through board groups.
 */

export async function getBoardPermissions(
    userId,
    boardUUID
) {

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

        let perms = [];


        /*
         * permissions is stored as JSON.
         *
         * Protect against NULL or malformed
         * JSON in the database.
         */

        try {

            perms = JSON.parse(
                group.permissions || "[]"
            );

        }
        catch {

            perms = [];

        }


        /*
         * Ignore invalid permission values.
         */

        if (!Array.isArray(perms)) {

            continue;

        }


        for (const permission of perms) {

            permissions.add(
                permission
            );

        }

    }


    return [
        ...permissions
    ];

}


/*
 * ============================================================
 * Accessible Boards
 * ============================================================
 */


/*
 * Get a single board if the user can access it.
 *
 * Administrator:
 *
 *     Can access every board.
 *
 * Normal user:
 *
 *     Must have BOARD_VIEW either globally
 *     or through a group on this board.
 */

export async function getAccessibleBoard(
    user,
    uuid
) {

    /*
     * There must be an authenticated user.
     */

    if (!user?.id) {

        return null;

    }


    /*
     * Find the board first.
     */

    const board =
        await getBoardByUUID(uuid);


    if (!board) {

        return null;

    }


    /*
     * Get permissions granted through
     * board groups.
     */

    const boardPermissions =
        await getBoardPermissions(
            user.id,
            uuid
        );


    /*
     * Check global + board permissions.
     *
     * hasBoardPermission() also automatically
     * allows administrators.
     */

    const canView =
        await hasBoardPermission(
            user,
            boardPermissions,
            Permission.BOARD_VIEW
        );


    if (!canView) {

        return null;

    }


    /*
     * Return the board and its board-specific
     * permissions.
     */

    return {

        ...board,

        permissions:
        boardPermissions

    };

}


/*
 * Get every board accessible to the user.
 *
 * Administrator:
 *
 *     Gets every board.
 *
 * Normal user:
 *
 *     Gets boards where they have BOARD_VIEW
 *     globally or through a board group.
 */

export async function getAccessibleBoards(
    user
) {

    /*
     * No authenticated user.
     */

    if (!user?.id) {

        return [];

    }


    /*
     * Load every board.
     */

    const boards =
        await getBoards();


    /*
     * ========================================================
     * Administrator
     * ========================================================
     *
     * hasPermission() checks the user's global
     * permissions and automatically grants
     * administrator access.
     */

    const administrator =
        await hasPermission(
            user,
            Permission.ADMINISTRATOR
        );


    if (administrator) {

        return boards.map(board => ({

            ...board,

            permissions: [
                Permission.ADMINISTRATOR
            ]

        }));

    }


    /*
     * ========================================================
     * Normal User
     * ========================================================
     */

    const accessibleBoards = [];


    for (const board of boards) {

        /*
         * Get permissions granted through
         * this board's groups.
         */

        const boardPermissions =
            await getBoardPermissions(
                user.id,
                board.uuid
            );


        /*
         * Check whether the user has BOARD_VIEW.
         *
         * This checks both:
         *
         * - Global permissions
         * - Board-specific permissions
         */

        const canView =
            await hasBoardPermission(
                user,
                boardPermissions,
                Permission.BOARD_VIEW
            );


        /*
         * No access to this board.
         */

        if (!canView) {

            continue;

        }


        /*
         * User can see the board.
         */

        accessibleBoards.push({

            ...board,

            permissions:
            boardPermissions

        });

    }


    return accessibleBoards;

}


/*
 * ============================================================
 * Board Groups For User
 * ============================================================
 */


/*
 * Get board groups for a user.
 *
 * The user must first have access to the board.
 *
 * Administrators automatically pass the access
 * check through getAccessibleBoard().
 */

export async function getBoardGroupsForUser(
    user,
    boardUUID
) {

    const board =
        await getAccessibleBoard(
            user,
            boardUUID
        );


    /*
     * Hide the existence of inaccessible
     * boards from the caller.
     */

    if (!board) {

        return null;

    }


    return await getBoardGroups(
        boardUUID
    );

}