import { ApiError } from "../utils/ApiError.js";

export const validate =
    (schema, pick = "body") =>
    (req, _res, next) => {
        if (!schema) return next();
        const { error, value } = schema.validate(req[pick], {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
        });
        if (error) {
            return next(
                new ApiError(
                    400,
                    "Validation error",
                    error.details.map((d) => d.message),
                ),
            );
        }
        req[pick] = value;
        next();
    };
