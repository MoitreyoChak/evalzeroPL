// src/__tests__/setup.ts
import { config } from "dotenv";
import { jest, beforeAll, afterAll } from "@jest/globals";

// Load test environment variables
config({ path: ".env.test" });

// Global test setup
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = "test";

  // Mock console methods in tests if needed
  // console.log = jest.fn();
  // console.error = jest.fn();
});

afterAll(() => {
  // Cleanup after all tests
});

// Global test utilities
(globalThis as any).testUtils = {
  // Add any global test utilities here
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  }),

  createMockResponse: () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.sendStatus = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    return res;
  },
};

// Extend Jest matchers if needed
declare global {
  namespace jest {
    interface Matchers<R> {
      // Add custom matchers here if needed
    }
  }

  var testUtils: {
    createMockRequest: (overrides?: any) => any;
    createMockResponse: () => any;
  };
}
