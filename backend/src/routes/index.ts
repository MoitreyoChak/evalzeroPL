import { Router } from "express";
import { signup_email_pwd } from "./signup_email_pwd";
import passport from "passport";
import { signin_email_pwd } from "./signin_email_pwd";
import { google_login_callback } from "./google_login_callback";

export const authRouter = Router()
  .post("/signup", signup_email_pwd)
  .post("/signin", signin_email_pwd)
  .get("/login/google", passport.authenticate("google"))
  .get("/callback/google", google_login_callback);
