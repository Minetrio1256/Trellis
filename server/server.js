import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import env from "./config/env.js";
import "./config/db.js";

const app = express();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dist = path.join(__dirname, "../client/dist");

app.use(express.static(dist));

app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(dist, "index.html"));
});

app.listen(env.PORT, () => {
    console.log(`Server listening on http://localhost:${env.PORT}`);
});