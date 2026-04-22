import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import app from "./app.js";
import { connectDb } from "./db/connectDb.js";

const PORT = process.env.PORT || 8000;

const requiredEnv = [
    "MONGODB_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "TEMP_TOKEN_SECRET",
];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
    console.error("Missing required env vars:", missing.join(", "));
    process.exit(1);
}

connectDb()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        const shutdown = (signal) => () => {
            console.log(`\n${signal} received. Shutting down...`);
            server.close(() => process.exit(0));
        };
        process.on("SIGINT", shutdown("SIGINT"));
        process.on("SIGTERM", shutdown("SIGTERM"));

        process.on("unhandledRejection", (err) => {
            console.error("Unhandled Rejection:", err);
        });
        process.on("uncaughtException", (err) => {
            console.error("Uncaught Exception:", err);
            process.exit(1);
        });
    })
    .catch((err) => {
        console.log("Error starting the server: ", err);
        process.exit(1);
    });
