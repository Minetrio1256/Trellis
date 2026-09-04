import express from "express";

import { auth } from "../middleware/auth.js";
import { permission } from "../services/permission.js";
import Permission from "../permissions.js";

import {
    findUser,
    getAllUsers
} from "../services/users.js";

import {
    getUserGroups,
    getUserPermissions,
    setUserGroups
} from "../services/globalGroup.js";

import {
    getDiscordGuildMember
} from "../services/discord.js";

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
    "/:id/discord",
    auth,
    permission(Permission.USER_VIEW),
    async (req, res) => {
        try {
            const member = await getDiscordGuildMember(
                req.params.id
            );

            if (!member?.user) {
                return res.sendStatus(404);
            }

            res.json({
                id: member.user.id,
                username: member.user.username,
                global_name: member.user.global_name,
                avatar: member.user.avatar
            });

        } catch (error) {
            if (error.response?.status === 404) {
                return res.sendStatus(404);
            }

            console.error(
                "Failed to fetch Discord user:",
                error.response?.data ??
                error.message
            );

            return res.sendStatus(502);
        }
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

        const targetUserId = req.params.id;

        await setUserGroups(
            targetUserId,
            req.body
        );

        if (req.user && (req.user.id === targetUserId || req.user.uuid === targetUserId)) {
            req.user.permissions = await getUserPermissions(targetUserId);
        }

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

router.get(
    "/",
    auth,
    permission(Permission.USER_VIEW),
    async (req, res) => {

        res.json(
            await getAllUsers()
        );

    }
);

const usersRouter = router;

export default usersRouter;