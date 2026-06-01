import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { sendError } from "../utils/response";

export const validate =
    (schema: ZodTypeAny) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
                next();
            } catch (err) {
                if (err instanceof ZodError) {
                    const zodErr = err as ZodError;

                    const errors = zodErr.issues.map((e) => ({
                        field: e.path.join("."),
                        message: e.message,
                    }));
                    return sendError(res, "Validation Error", 422, errors);
                }
                next(err);
            }
        };