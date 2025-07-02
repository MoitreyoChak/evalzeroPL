// Entry Point
import express from "express";
import cors from "cors";
import { authRouter } from "./routes";
import injectDatabaseMiddleware from "./middleware/inject-db.mw";
import passport from "passport";
import { googleStrategy } from "./util/auth";

passport.use(googleStrategy);

const app = express();
app.use(cors());
app.use(express.json());
app.use(injectDatabaseMiddleware);
app.use("/api/auth", authRouter);

const port = Number.parseInt(process.env.PORT!);
const hostname = process.env.HOST!;
app.listen(port, hostname, () => {
  console.log(`Started listening at ${hostname}:${port}`);
});
