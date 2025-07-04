import { Request, Response, NextFunction } from "express";
import injectDatabaseMiddleware from "../../middleware/inject-db.mw";
import { zodValidateMiddleware } from "../../middleware/z-validate.mw";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { jest } from "@jest/globals";

// Mock the database
jest.mock("../../db", () => ({
  getDatabase: jest.fn().mockReturnValue("mocked-db"),
}));

describe("Middleware", () => {
  describe("injectDatabaseMiddleware", () => {
    it("should inject database into request", () => {
      const req = {} as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      injectDatabaseMiddleware(req, res, next);

      expect(req.db).toBe("mocked-db");
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
// This test suite covers the injectDatabaseMiddleware and zodValidateMiddleware.
// It ensures that the database is correctly injected into the request object and that the Zod validation
// middleware correctly validates request bodies according to the defined schema.
// The tests use Jest's mocking capabilities to simulate the database and validate the middleware behavior.
