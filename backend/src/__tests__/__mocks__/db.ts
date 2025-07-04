// src/__tests__/__mocks__/db.ts
import { jest } from "@jest/globals";

// Create a mock database object that matches your Drizzle ORM interface
export const mockDb = {
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
  // Add more Drizzle ORM methods as needed
};

// Mock the getDatabase function
export const mockGetDatabase = jest.fn().mockReturnValue(mockDb);

// Default export for the entire db module mock
const dbMock = {
  getDatabase: mockGetDatabase,
};

export default dbMock;
