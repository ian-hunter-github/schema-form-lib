import '@testing-library/jest-dom/vitest';
import { vi, beforeAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock SchemaRenderer
vi.mock('../components/SchemaRenderer', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => null)
}));

// Run cleanup after each test
afterEach(() => {
  cleanup();
});

// Ensure all tests have access to globals
beforeAll(() => {
  // Add any global test setup here
});
