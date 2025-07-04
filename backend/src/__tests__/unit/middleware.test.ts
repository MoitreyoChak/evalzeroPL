import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { jest } from "@jest/globals";

// Import the mock
import { mockDb, mockGetDatabase } from "../__mocks__/db";

// Mock the db module
jest.mock("../../db", () => ({
  getDatabase: mockGetDatabase,
}));

// Import after mocking
import injectDatabaseMiddleware from "../../middleware/inject-db.mw";
import { zodValidateMiddleware } from "../../middleware/z-validate.mw";

describe("Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("injectDatabaseMiddleware", () => {
    it("should inject database into request", () => {
      const req = {} as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      injectDatabaseMiddleware(req, res, next);

      expect(req.db).toBe(mockDb);
      expect(mockGetDatabase).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
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
  });
});
