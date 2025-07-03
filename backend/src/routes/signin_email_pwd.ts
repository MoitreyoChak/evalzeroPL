import { Request, Response, Router } from "express";
import { basicAuthTable, usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { generateJWT } from "../providers/auth.p";
import { zodValidateMiddleware } from "../middleware/z-validate.mw";

const reqBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type RequestBody = z.infer<typeof reqBodySchema>;

const handler = async (req: Request<any, any, RequestBody>, res: Response) => {
  const { db } = req;

  // select u.id, b.password from users u, basic_auth b where u.email = email and b.user_id = u.id;
  const [r] = await db
    .select({ id: usersTable.id, password: basicAuthTable.password })
    .from(usersTable)
    .where(eq(usersTable.email, req.body.email))
    .innerJoin(basicAuthTable, eq(usersTable.id, basicAuthTable.userId));

  if (!r) {
    res.sendStatus(404);
    return;
  }
  if (req.body.password !== r.password) {
    res.sendStatus(401);
    return;
  }
  const token = await generateJWT({ id: r.id });
  res.status(200).send(token);
};

export const signin_email_pwd = Router().use(
  zodValidateMiddleware(reqBodySchema),
  handler
);
