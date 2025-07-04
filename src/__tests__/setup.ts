import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('../components/SchemaRenderer', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => null) // Mock as null component
}));
