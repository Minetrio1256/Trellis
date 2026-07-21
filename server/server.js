import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from Express!" });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dist = path.join(__dirname, "../client/dist");

app.use(express.static(dist));

app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(dist, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});