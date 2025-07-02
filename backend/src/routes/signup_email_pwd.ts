import { Request, Response } from "express";
import { z } from "zod";
import { getDatabase } from "../db";
import { accountsTable, basicAuthTable, usersTable } from "../db/schema";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type SignupDTO = z.infer<typeof signupSchema>;

export const signup_email_pwd = async (
  req: Request<any, any, SignupDTO>,
  res: Response
) => {
  const db = getDatabase();
  await db.transaction(async (tx) => {
    const [{ userId }] = await tx
      .insert(usersTable)
      .values({
        email: req.body.email,
        name: req.body.email.substring(0, req.body.email.indexOf("@")),
        emailVerified: false,
      })
      .returning({ userId: usersTable.id });
    await tx.insert(basicAuthTable).values({
      userId,
      password: req.body.password,
    });
  });
  res.sendStatus(200);
};
