import { NextFunction, Request, Response } from "express";
import { getDatabase } from "../db";

declare global {
  namespace Express {
    export interface Request {
      db: ReturnType<typeof getDatabase>;
    }
  }
}

const injectDatabaseMiddleware = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  req.db = getDatabase();
  next();
};

export default injectDatabaseMiddleware;
