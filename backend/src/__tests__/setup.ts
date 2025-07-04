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

  // Database test utilities
  createMockDbResult: (data: any = {}) => ({
    // Mock typical Drizzle ORM query results
    ...data,
  }),

  createMockUser: (overrides = {}) => ({
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    emailVerified: false,
    avatar: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  createMockTransaction: (callback: any) => {
    // Mock transaction that just calls the callback with a mock tx object
    const mockTx = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
    };
    return callback(mockTx);
  },

  resetAllDbMocks: () => {
    // This will be useful for resetting database mocks between tests
    // You can import your db mock and reset it here
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
    createMockDbResult: (data?: any) => any;
    createMockUser: (overrides?: any) => any;
    createMockTransaction: (callback: any) => any;
    resetAllDbMocks: () => void;
  };
}

// Mock fetch globally if needed for your tests
global.fetch = jest.fn();
