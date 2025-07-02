import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { getDatabase } from "../db";
import { accountsTable, usersTable } from "../db/schema";
import { and, eq } from "drizzle-orm";

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "http://localhost:8000/api/auth/callback/google",
    scope: ["profile", "email"],
  },
  async (accessToken, refreshToken, profile, cb) => {
    // Look for existing accounts
    // console.log(accessToken, refreshToken, profile);
    const db = getDatabase();
    try {
      const user: { id: string; name: string; avatar?: string | null } =
        await db.transaction(async (tx) => {
          const [account] = await tx
            .select({
              id: accountsTable.id,
              userId: accountsTable.userId,
              userName: usersTable.name,
              userAvatar: usersTable.avatar,
            })
            .from(accountsTable)
            .where(
              and(
                eq(accountsTable.provider, "google"),
                eq(accountsTable.providerId, profile.id)
              )
            )
            .innerJoin(usersTable, eq(usersTable.id, accountsTable.userId));

          if (account) {
            console.log("Found existing account");
            return {
              name: account.userName,
              id: account.userId,
              avatar: account.userAvatar,
            };
          }

          const [{ userId }] = await tx
            .insert(usersTable)
            .values({
              name: profile.displayName,
              avatar: profile.photos?.at(0)?.value,
              email: profile.emails?.at(0)?.value!,
              emailVerified: !!profile.emails?.at(0)?.verified,
            })
            .returning({ userId: usersTable.id });
          await tx.insert(accountsTable).values({
            userId: userId,
            provider: "google",
            providerId: profile.id,
            accessToken,
            refreshToken,
          });
          return {
            name: profile.displayName,
            id: userId,
            avatar: profile.photos?.at(0)?.value,
          };
        });
      if (!user) return cb(null, false);
      return cb(null, user);
    } catch (err) {
      console.error(err);
      return cb(err);
    }
  }
);
