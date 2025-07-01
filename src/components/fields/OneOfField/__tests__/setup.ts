import { vi } from 'vitest';
import { SchemaRendererMock } from './SchemaRenderer.mock';

vi.mock('../../SchemaRenderer', () => ({
  __esModule: true,
  SchemaRenderer: vi.fn().mockImplementation(SchemaRendererMock)
}));
