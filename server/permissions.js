// permission.js

const Permission = Object.freeze({

    /*
     * Super User
     */
    ADMINISTRATOR: "administrator",

    /*
     * Global
     */
    USER_VIEW: "user.view",
    USER_CREATE: "user.create",
    USER_EDIT: "user.edit",
    USER_DELETE: "user.delete",

    GROUP_VIEW: "group.view",
    GROUP_CREATE: "group.create",
    GROUP_EDIT: "group.edit",
    GROUP_DELETE: "group.delete",

    BOARD_VIEW: "board.view",
    BOARD_CREATE: "board.create",
    BOARD_EDIT: "board.edit",
    BOARD_DELETE: "board.delete",

    /*
     * Board
     */
    TASK_VIEW: "task.view",
    TASK_CREATE: "task.create",
    TASK_EDIT: "task.edit",
    TASK_DELETE: "task.delete",

    COLUMN_VIEW: "column.view",
    COLUMN_CREATE: "column.create",
    COLUMN_EDIT: "column.edit",
    COLUMN_DELETE: "column.delete",

    COMMENT_VIEW: "comment.view",
    COMMENT_CREATE: "comment.create",
    COMMENT_EDIT: "comment.edit",
    COMMENT_DELETE: "comment.delete",

    MEMBER_VIEW: "member.view",
    MEMBER_ADD: "member.add",
    MEMBER_REMOVE: "member.remove",

    SETTINGS_VIEW: "settings.view",
    SETTINGS_EDIT: "settings.edit"

});

export default Permission;