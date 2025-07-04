import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { jest } from "@jest/globals";

// Create the mock database directly in this file
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  transaction: jest.fn(),
};

const mockGetDatabase = jest.fn().mockReturnValue(mockDb);

// Mock the db module before importing the middleware
jest.mock("../db/index", () => ({
  getDatabase: mockGetDatabase,
}));

// Import after mocking
import injectDatabaseMiddleware from "../../middleware/inject-db.mw";
import { zodValidateMiddleware } from "../../middleware/z-validate.mw";

describe("Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("zodValidateMiddleware", () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });

    it("should validate valid request body", async () => {
      const req = {
        body: { email: "test@example.com", password: "password123" },
      } as Request;
      const res = global.testUtils.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = zodValidateMiddleware(schema);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid request body", async () => {
      const req = {
        body: { email: "invalid-email", password: "123" },
      } as Request;
      const res = global.testUtils.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = zodValidateMiddleware(schema);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errors: expect.any(Array) })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle missing required fields", async () => {
      const req = {
        body: {},
      } as Request;
      const res = global.testUtils.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = zodValidateMiddleware(schema);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errors: expect.any(Array) })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle non-ZodError exceptions", async () => {
      const throwingSchema = z.object({
        test: z.string().transform(() => {
          throw new Error("Non-Zod error");
        }),
      });

      const req = {
        body: { test: "value" },
      } as Request;
      const res = global.testUtils.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = zodValidateMiddleware(throwingSchema);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
