export class PathBuilder {
  static buildPath(prefix: string, key: string): string {
    return prefix ? `${prefix}.${key}` : key;
  }

  static getParentPath(path: string): string | null {
    const lastDotIndex = path.lastIndexOf('.');
    return lastDotIndex === -1 ? null : path.substring(0, lastDotIndex);
  }

  static getFieldName(path: string): string {
    const lastDotIndex = path.lastIndexOf('.');
    return lastDotIndex === -1 ? path : path.substring(lastDotIndex + 1);
  }

  static isChildPath(parentPath: string, childPath: string): boolean {
    return childPath.startsWith(parentPath + '.');
  }

  static getPathParts(path: string): string[] {
    return path.split('.');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getNestedValue<T = unknown>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: Record<string, any>,
    path: string
  ): T | undefined {
    const parts = path.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = obj;

    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[part];
    }

    return current as T;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static setNestedValue<T = unknown>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: Record<string, any>,
    path: string,
    value: T
  ): void {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }
}
