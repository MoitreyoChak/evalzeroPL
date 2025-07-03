import { getDatabase } from "../db";

declare global {
  namespace Express {
    export interface Request {
      db: ReturnType<typeof getDatabase>;
    }

    export interface User {
      id: string;
    }
  }
}
