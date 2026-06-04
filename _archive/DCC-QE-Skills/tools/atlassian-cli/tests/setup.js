/**
 * Jest Setup File
 * 
 * This file runs before all tests to configure the test environment.
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.OUTPUT_DIR = './test-output';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
