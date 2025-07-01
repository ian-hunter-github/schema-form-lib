import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { SchemaRendererMock } from '../components/fields/OneOfField/__tests__/SchemaRenderer.mock';

vi.mock('../components/SchemaRenderer', () => ({
  __esModule: true,
  SchemaRenderer: vi.fn().mockImplementation(SchemaRendererMock)
}));
