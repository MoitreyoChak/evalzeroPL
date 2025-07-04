import request from "supertest";
import express from "express";
import { authRouter } from "../../routes";
import injectDatabaseMiddleware from "../../middleware/inject-db.mw";
import { jest } from "@jest/globals";

// Mock the database and its operations
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  transaction: jest.fn(),
};

jest.mock("../../db", () => ({
  getDatabase: jest.fn().mockReturnValue(mockDb),
}));

// Mock JWT generation
jest.mock("../../providers/auth.p", () => ({
  generateJWT: jest.fn().mockResolvedValue("mocked-jwt-token"),
}));

describe("Auth Routes Integration", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(injectDatabaseMiddleware);
    app.use("/auth", authRouter);

    jest.clearAllMocks();
  });

  describe("POST /auth/signup", () => {
    it("should create a new user and return JWT token", async () => {
      // Mock successful database transaction
      mockDb.transaction.mockImplementation(async (callback) => {
        const tx = {
          insert: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([{ userId: "new-user-id" }]),
        };
        return callback(tx);
      });

      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/auth/signup")
        .send(userData)
        .expect(200);

      expect(response.text).toBe("mocked-jwt-token");
      expect(mockDb.transaction).toHaveBeenCalled();
    });

    it("should handle database errors during signup", async () => {
      // Mock database error
      mockDb.transaction.mockRejectedValue(new Error("Database error"));

      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      await request(app).post("/auth/signup").send(userData).expect(500);
    });
  });

  describe("POST /auth/signin", () => {
    it("should authenticate user and return JWT token", async () => {
      // Mock successful database query
      mockDb.select.mockResolvedValue([
        {
          id: "user-id",
          password: "password123",
        },
      ]);

      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/auth/signin")
        .send(loginData)
        .expect(200);

      expect(response.text).toBe("mocked-jwt-token");
    });

    it("should return 404 for non-existent user", async () => {
      // Mock empty database result
      mockDb.select.mockResolvedValue([]);

      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      await request(app).post("/auth/signin").send(loginData).expect(404);
    });

    it("should return 401 for wrong password", async () => {
      // Mock user found but wrong password
      mockDb.select.mockResolvedValue([
        {
          id: "user-id",
          password: "correct-password",
        },
      ]);

      const loginData = {
        email: "test@example.com",
        password: "wrong-password",
      };

      await request(app).post("/auth/signin").send(loginData).expect(401);
    });

    it("should return 400 for invalid email format", async () => {
      const loginData = {
        email: "invalid-email",
        password: "password123",
      };

      await request(app).post("/auth/signin").send(loginData).expect(400);
    });

    it("should return 400 for short password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "123",
      };

      await request(app).post("/auth/signin").send(loginData).expect(400);
    });
  });
});
