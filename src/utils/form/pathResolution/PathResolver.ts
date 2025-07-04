export class PathResolver {
  static parsePath(path: string): string[] {
    return path ? path.split('.') : [];
  }

  static getParentPath(path: string): string {
    const lastDotIndex = path.lastIndexOf('.');
    return lastDotIndex > 0 ? path.substring(0, lastDotIndex) : '';
  }

  static getPropertyName(path: string): string {
    const lastDotIndex = path.lastIndexOf('.');
    return lastDotIndex >= 0 ? path.substring(lastDotIndex + 1) : path;
  }

  static isArrayIndex(pathSegment: string): boolean {
    return !isNaN(Number(pathSegment));
  }

  static getArrayIndex(pathSegment: string): number {
    const index = parseInt(pathSegment, 10);
    return isNaN(index) ? -1 : index;
  }

  static buildPath(segments: string[]): string {
    return segments.join('.');
  }

  static isNestedPath(path: string): boolean {
    return path.includes('.');
  }

  static getPathDepth(path: string): number {
    return path ? path.split('.').length : 0;
  }

  static isChildPath(parentPath: string, childPath: string): boolean {
    if (!parentPath) return true;
    return childPath.startsWith(parentPath + '.');
  }

  static getRelativePath(basePath: string, fullPath: string): string {
    if (!basePath) return fullPath;
    if (fullPath.startsWith(basePath + '.')) {
      return fullPath.substring(basePath.length + 1);
    }
    return fullPath;
  }
}
