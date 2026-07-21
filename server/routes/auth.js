import { Router } from "express";
import {
    getOAuthURL,
    exchangeCode,
    getUser,
    getGuildMember,
    hasRequiredRole
} from "../services/discord.js";

import { createJWT } from "../services/jwt.js";
import { saveSession } from "../services/users.js";

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

        const tokenJWT = createJWT(discordUser.id);

        const decoded = JSON.parse(
            Buffer.from(
                tokenJWT.split(".")[1],
                "base64"
            ).toString()
        );


        await saveSession(
            discordUser.id,
            tokenJWT,
            new Date(decoded.exp * 1000)
        );


        res.cookie(
            "token",
            tokenJWT,
            {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
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

router.get("/me", async (req,res)=>{

    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            authenticated:false
        });
    }

    res.json({
        authenticated:true
    });

});


router.post("/logout", async(req,res)=>{

    res.clearCookie("token");

    res.json({
        success:true
    });

});

export default router;