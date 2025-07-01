// Jest setup file
// Add any global test setup here

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console.log to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
