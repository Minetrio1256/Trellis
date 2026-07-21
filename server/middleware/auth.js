import { verifyJWT } from "../services/jwt.js";
import { findUser } from "../services/users.js";


export async function auth(req, res, next) {

    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                error: "Not authenticated"
            });
        }


        const payload = verifyJWT(token);


        const user = await findUser(payload.id);


        if (!user || user.jwt !== token) {
            return res.status(401).json({
                error: "Invalid session"
            });
        }


        if (
            new Date(user.jwt_expire) < new Date()
        ) {
            return res.status(401).json({
                error: "Expired session"
            });
        }


        req.user = user;

        next();


    } catch (err) {

        return res.status(401).json({
            error: "Invalid token"
        });

    }
}