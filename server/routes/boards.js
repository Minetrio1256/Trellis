import express from "express";
import { v4 as uuid } from "uuid";

import { auth } from "../middleware/auth.js";
import {
    getAccessibleBoards,
    getAccessibleBoard,
    getBoardGroupsForUser,

    createBoard,
    updateBoard,
    deleteBoard,

    createBoardGroup,
    updateBoardGroup,
    deleteBoardGroup,

    addBoardMember,
    removeBoardMember
} from "../services/boards.js";

const router = express.Router();


/*
 * Get boards user can access
 */
router.get(
    "/",
    auth,
    async (req, res) => {

        const boards = await getAccessibleBoards(
            req.user
        );

        res.json(boards);

    }
);


/*
 * Get single board
 */
router.get(
    "/:uuid",
    auth,
    async (req, res) => {

        const board = await getAccessibleBoard(
            req.user,
            req.params.uuid
        );

        // hide existence of inaccessible boards
        if (!board) {
            return res.sendStatus(404);
        }

        res.json(board);

    }
);


/*
 * Create board
 */
router.post(
    "/",
    auth,
    async (req, res) => {

        const id = uuid();

        await createBoard(
            id,
            req.body.name,
            req.body.description,
            req.user.id
        );

        res.status(201).json({
            uuid: id
        });

    }
);


/*
 * Edit board
 */
router.patch(
    "/:uuid",
    auth,
    async (req, res) => {

        const success = await updateBoard(
            req.user,
            req.params.uuid,
            req.body.name,
            req.body.description
        );

        if (!success) {
            return res.sendStatus(403);
        }

        res.sendStatus(204);

    }
);


/*
 * Delete board
 */
router.delete(
    "/:uuid",
    auth,
    async (req, res) => {

        const success = await deleteBoard(
            req.user,
            req.params.uuid
        );

        if (!success) {
            return res.sendStatus(403);
        }

        res.sendStatus(204);

    }
);


/*
 * Board groups
 */

router.get(
    "/:uuid/groups",
    auth,
    async (req, res) => {

        const groups = await getBoardGroupsForUser(
            req.user,
            req.params.uuid
        );

        if (!groups) {
            return res.sendStatus(404);
        }

        res.json(groups);

    }
);


router.post(
    "/:uuid/groups",
    auth,
    async (req, res) => {

        const id = uuid();

        const success = await createBoardGroup(
            req.user,
            id,
            req.params.uuid,
            req.body.name,
            req.body.description,
            req.body.permissions
        );

        if (!success) {
            return res.sendStatus(403);
        }

        res.status(201).json({
            uuid: id
        });

    }
);


router.patch(
    "/groups/:groupUuid",
    auth,
    async (req, res) => {

        const success = await updateBoardGroup(
            req.user,
            req.params.groupUuid,
            req.body.name,
            req.body.description,
            req.body.permissions
        );

        if (!success) {
            return res.sendStatus(403);
        }

        res.sendStatus(204);

    }
);


router.delete(
    "/groups/:groupUuid",
    auth,
    async (req, res) => {

        const success = await deleteBoardGroup(
            req.user,
            req.params.groupUuid
        );

        if (!success) {
            return res.sendStatus(403);
        }

        res.sendStatus(204);

    }
);


/*
 * Board members
 */

router.post(
    "/groups/:groupUuid/users/:userId",
    auth,
    async (req, res) => {

        const success = await addBoardMember(
            req.user,
            req.params.groupUuid,
            req.params.userId
        );

        if (!success) {
            return res.sendStatus(403);
        }

        res.sendStatus(204);

    }
);


router.delete(
    "/groups/:groupUuid/users/:userId",
    auth,
    async (req, res) => {

        const success = await removeBoardMember(
            req.user,
            req.params.groupUuid,
            req.params.userId
        );

        if (!success) {
            return res.sendStatus(403);
        }

        res.sendStatus(204);

    }
);

const boardsRouter = router;

export default boardsRouter;