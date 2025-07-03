import { Request, Response, Router } from "express";
import passport from "passport";
import { generateJWT } from "../providers/auth.p";

const handler = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    res.redirect("/login");
    return;
  }
  const token = await generateJWT(req.user);
  res.cookie("x-access-token", token).redirect("/");
};

export const google_login_callback = Router().use(
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
    failureMessage: true,
  }),
  handler
);
