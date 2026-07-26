import express from "express";

import { auth } from "../middleware/auth.js";
import permission from "../middleware/permission.js";
import Permission from "../permissions.js";

import {
    findUser
} from "../services/users.js";

import {
    getUserGroups,
    getUserPermissions,
    setUserGroups
} from "../services/globalGroups.js";

const router = express.Router();

router.get(
    "/:id",
    auth,
    permission(Permission.USER_VIEW),
    async (req, res) => {

        const user = await findUser(req.params.id);

        if (!user) {
            return res.sendStatus(404);
        }

        res.json(user);

    }
);

router.get(
    "/:id/groups",
    auth,
    permission(Permission.USER_VIEW),
    async (req, res) => {

        res.json(
            await getUserGroups(req.params.id)
        );

    }
);

router.put(
    "/:id/groups",
    auth,
    permission(Permission.GROUP_EDIT),
    async (req, res) => {

        await setUserGroups(
            req.params.id,
            req.body
        );

        res.sendStatus(204);

    }
);

router.get(
    "/:id/permissions",
    auth,
    permission(Permission.USER_VIEW),
    async (req, res) => {

        res.json(
            await getUserPermissions(req.params.id)
        );

    }
);

export default router;