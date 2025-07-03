import { NextFunction, Request, Response } from "express";
import { getDatabase } from "../db";

const injectDatabaseMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.db = getDatabase();
  next();
};

export default injectDatabaseMiddleware;
