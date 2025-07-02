import { Router } from "express";
import { signup_email_pwd } from "./signup_email_pwd";
import passport from "passport";

export const authRouter = Router()
  .post("/signup", signup_email_pwd)
  .get("/login/google", passport.authenticate("google"))
  .get(
    "/callback/google",
    passport.authenticate("google", {
      session: false,
      failureRedirect: "/login",
      failureMessage: true,
    }),
    (req, res) => {
      console.log("Requesting user", req.user);
      res.redirect("/");
    }
  );
