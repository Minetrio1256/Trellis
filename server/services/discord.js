import axios from "axios";
import env from "../config/env.js";

const API = "https://discord.com/api/v10";

export function getOAuthURL() {
    const params = new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        redirect_uri: env.DISCORD_REDIRECT_URI,
        response_type: "code",
        scope: "identify guilds.members.read"
    });

    return `${API}/oauth2/authorize?${params}`;
}

export async function exchangeCode(code) {
    const body = new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: env.DISCORD_REDIRECT_URI
    });

    const { data } = await axios.post(
        `${API}/oauth2/token`,
        body.toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    );

    return data;
}

export async function getUser(accessToken) {
    const { data } = await axios.get(
        `${API}/users/@me`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );

    return data;
}

export async function getGuildMember(accessToken, userId) {
    const { data } = await axios.get(
        `${API}/users/@me/guilds/${env.DISCORD_GUILD_ID}/member`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );

    return data;
}

export function hasRequiredRole(member) {
    return member.roles.includes(env.DISCORD_REQUIRED_ROLE);
}