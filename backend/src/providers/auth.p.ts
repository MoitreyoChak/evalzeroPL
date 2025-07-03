import * as jose from "jose";

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function generateJWT(user: { id: string }) {
  const claims = {
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": "user",
      "x-hasura-allowed-roles": ["user", "admin"],
      "x-hasura-user-id": user.id,
    },
  };
  const jwt = await new jose.SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .sign(jwtSecret);
  return jwt;
}
