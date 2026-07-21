import dotenv from "dotenv";

dotenv.config();

function required(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

const env = Object.freeze({
    // Server
    PORT: Number(process.env.PORT ?? 3000),

    // Database
    DB_HOST: required("DB_HOST"),
    DB_PORT: Number(process.env.DB_PORT ?? 3306),
    DB_USER: required("DB_USER"),
    DB_PASS: required("DB_PASS"),
    DB_NAME: required("DB_NAME"),

    // JWT
    JWT_SECRET: required("JWT_SECRET"),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",

    // Discord OAuth
    DISCORD_CLIENT_ID: required("DISCORD_CLIENT_ID"),
    DISCORD_CLIENT_SECRET: required("DISCORD_CLIENT_SECRET"),
    DISCORD_REDIRECT_URI: required("DISCORD_REDIRECT_URI"),

    // Discord authorization
    DISCORD_GUILD_ID: required("DISCORD_GUILD_ID"),
    DISCORD_REQUIRED_ROLE: required("DISCORD_REQUIRED_ROLE")
});

export default env;