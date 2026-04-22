import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

const TEMP_DIR = path.resolve("public", "temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, TEMP_DIR),
    filename: (_req, file, cb) => {
        const safe = file.originalname.replace(/[^\w.\-]/g, "_");
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const allowed = /jpe?g|png|webp|gif|svg\+xml/;
    if (allowed.test(file.mimetype)) return cb(null, true);
    cb(new ApiError(400, "Only image files are allowed"));
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
