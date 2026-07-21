import jwt from "jsonwebtoken";
import env from "../config/env.js";

export function createJWT(userId) {
    return jwt.sign(
        {
            id: userId
        },
        env.JWT_SECRET,
        {
            expiresIn: env.JWT_EXPIRES_IN
        }
    );
}

export function verifyJWT(token) {
    return jwt.verify(
        token,
        env.JWT_SECRET
    );
}