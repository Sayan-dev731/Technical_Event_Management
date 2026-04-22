import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, _next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        if (error?.name === "ValidationError") {
            error = new ApiError(
                400,
                "Validation failed",
                Object.values(error.errors).map((e) => e.message),
            );
        } else if (error?.name === "CastError") {
            error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
        } else if (error?.code === 11000) {
            const field = Object.keys(error.keyValue || {})[0] || "field";
            error = new ApiError(409, `Duplicate ${field}`);
        } else {
            const status = error?.statusCode || 500;
            error = new ApiError(
                status,
                error?.message || "Internal Server Error",
                [],
                error?.stack,
            );
        }
    }

    if (process.env.NODE_ENV !== "production") {
        console.error("[ERROR]", error.statusCode, error.message);
        if (error.stack) console.error(error.stack);
    }

    res.status(error.statusCode).json({
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.data || [],
        ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
    });
};

export const notFoundHandler = (req, _res, next) => {
    next(
        new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`),
    );
};
