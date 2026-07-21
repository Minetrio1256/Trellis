import { Router } from "express";
import {
    getOAuthURL,
    exchangeCode,
    getUser,
    getGuildMember,
    hasRequiredRole
} from "../services/discord.js";

import { createJWT } from "../services/jwt.js";

const router = Router();

router.get("/login", (req, res) => {
    res.redirect(getOAuthURL());
});


router.get("/callback", async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).send("Missing Discord code");
        }

        const token = await exchangeCode(code);

        const discordUser = await getUser(token.access_token);

        const member = await getGuildMember(
            token.access_token,
            discordUser.id
        );

        if (!hasRequiredRole(member)) {
            return res.status(403).send("Missing required role");
        }

        const jwt = createJWT(discordUser.id);

        res.cookie(
            "token",
            jwt,
            {
                httpOnly: true,
                secure: false, // true later with HTTPS
                sameSite: "lax",
                maxAge: 1000 * 60 * 60 * 24 * 7
            }
        );

        res.redirect("/");

        console.log("Authenticated:", discordUser);

        res.send("Auth successful");
    } catch (err) {
        console.error(err.response?.data ?? err);
        res.status(500).send("Authentication failed");
    }
});

router.get("/me", (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            authenticated: false
        });
    }

    res.json({
        authenticated: true
    });
});

export default router;