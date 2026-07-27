import express from "express";
import { v4 as uuid } from "uuid";

import { auth } from "../middleware/auth.js";
import { hasPermission } from "../services/permission.js";
import Permission from "../permissions.js";

import {
    getAllGroups,
    getGroupByUUID,
    createGroup,
    updateGroup,
    deleteGroup,
    addUserGroup,
    removeUserGroup
} from "../services/globalGroup.js";

const router = express.Router();

router.get(
    "/",
    auth,
    permission(Permission.GROUP_VIEW),
    async (req, res) => {
        res.json(await getAllGroups());
    }
);

router.get(
    "/:uuid",
    auth,
    permission(Permission.GROUP_VIEW),
    async (req, res) => {

        const group = await getGroupByUUID(req.params.uuid);

        if (!group) {
            return res.sendStatus(404);
        }

        res.json(group);

    }
);

router.post(
    "/",
    auth,
    permission(Permission.GROUP_CREATE),
    async (req, res) => {

        const {
            name,
            description,
            permissions,
            discord_role_id
        } = req.body;

        const id = uuid();

        await createGroup(
            id,
            name,
            description,
            permissions,
            discord_role_id
        );

        res.status(201).json({
            uuid: id
        });

    }
);

router.patch(
    "/:uuid",
    auth,
    permission(Permission.GROUP_EDIT),
    async (req, res) => {

        await updateGroup(
            req.params.uuid,
            req.body.name,
            req.body.description,
            req.body.permissions,
            req.body.discord_role_id
        );

        res.sendStatus(204);

    }
);

router.delete(
    "/:uuid",
    auth,
    permission(Permission.GROUP_DELETE),
    async (req, res) => {

        await deleteGroup(req.params.uuid);

        res.sendStatus(204);

    }
);

router.post(
    "/:uuid/users/:userId",
    auth,
    permission(Permission.GROUP_EDIT),
    async (req, res) => {

        await addUserGroup(
            req.params.userId,
            req.params.uuid
        );

        res.sendStatus(204);

    }
);

router.delete(
    "/:uuid/users/:userId",
    auth,
    permission(Permission.GROUP_EDIT),
    async (req, res) => {

        await removeUserGroup(
            req.params.userId,
            req.params.uuid
        );

        res.sendStatus(204);

    }
);

export default groupsRouter;