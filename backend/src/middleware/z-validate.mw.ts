import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import { StatusCodes } from "http-status-codes";

// Zod Request Body validation middleware
export const zodValidateMiddleware = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const r = await schema.parseAsync(req.body)
      req.body = r;
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((issue) => issue);
        res.status(StatusCodes.BAD_REQUEST).json({ errors });
        return;
      } else {
        next(err);
      }
    }
    next();
  };
};
