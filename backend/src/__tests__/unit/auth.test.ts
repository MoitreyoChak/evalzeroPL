// ESM mocking for jose
import { jest } from "@jest/globals";
import type { SignJWT as OriginalSignJWT } from "jose";

// Mock the jose library using jest.unstable_mockModule for ESM
const setProtectedHeader = jest.fn().mockReturnThis();
const setSubject = jest.fn().mockReturnThis();
const setIssuedAt = jest.fn().mockReturnThis();
const sign = jest.fn().mockResolvedValue("mocked-jwt-token");

jest.unstable_mockModule("jose", () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader,
    setSubject,
    setIssuedAt,
    sign,
  })) as unknown as new () => InstanceType<typeof OriginalSignJWT>,
}));

describe("Auth Provider", () => {
  let generateJWT: typeof import("../../providers/auth.p").generateJWT;
  let jose: typeof import("jose");

  beforeAll(async () => {
    // Dynamically import after mocking
    jose = await import("jose");
    ({ generateJWT } = await import("../../providers/auth.p"));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("generateJWT", () => {
    it("should generate a JWT token with correct claims", async () => {
      const user = { id: "test-user-id" };
      const token = await generateJWT(user);

      expect(token).toBe("mocked-jwt-token");
      expect(jose.SignJWT).toHaveBeenCalledWith({
        "https://hasura.io/jwt/claims": {
          "x-hasura-default-role": "user",
          "x-hasura-allowed-roles": ["user", "admin"],
          "x-hasura-user-id": user.id,
        },
      });
    });

    it("should set correct JWT headers and subject", async () => {
      const user = { id: "test-user-id" };
      await generateJWT(user);

      expect(setProtectedHeader).toHaveBeenCalledWith({ alg: "HS256" });
      expect(setSubject).toHaveBeenCalledWith(user.id);
      expect(setIssuedAt).toHaveBeenCalled();
    });
  });
});
