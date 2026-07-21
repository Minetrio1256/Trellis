import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";

import env from "./config/env.js";
import "./config/db.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

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