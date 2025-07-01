import { PathResolver } from '../PathResolver';

describe('PathResolver with oneOf support', () => {
  it('should ignore oneOf in path construction', () => {
    // Path should skip oneOf node
    const path = 'contactMethod.email';
    const segments = PathResolver.parsePath(path);
    expect(segments).toEqual(['contactMethod', 'email']);
  });

  it('should handle parent paths correctly with oneOf', () => {
    const path = 'contactMethod.email';
    expect(PathResolver.getParentPath(path)).toBe('contactMethod');
  });

  it('should handle property names correctly with oneOf', () => {
    const path = 'contactMethod.email';
    expect(PathResolver.getPropertyName(path)).toBe('email');
  });

  it('should build paths correctly with oneOf', () => {
    const segments = ['contactMethod', 'email'];
    expect(PathResolver.buildPath(segments)).toBe('contactMethod.email');
  });
});
