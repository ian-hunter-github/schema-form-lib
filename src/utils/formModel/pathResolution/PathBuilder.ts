export class PathBuilder {
  static buildChildPath(parentPath: string, childKey: string): string {
    return parentPath ? `${parentPath}.${childKey}` : childKey;
  }

  static buildArrayItemPath(arrayPath: string, index: number): string {
    return `${arrayPath}.${index}`;
  }

  static buildPropertyPath(objectPath: string, propertyName: string): string {
    return this.buildChildPath(objectPath, propertyName);
  }

  static buildNestedPath(basePath: string, ...segments: string[]): string {
    const allSegments = basePath ? [basePath, ...segments] : segments;
    return allSegments.join('.');
  }

  static generatePathsForObject(basePath: string, propertyNames: string[]): string[] {
    return propertyNames.map(name => this.buildPropertyPath(basePath, name));
  }

  static generatePathsForArray(arrayPath: string, length: number): string[] {
    const paths: string[] = [];
    for (let i = 0; i < length; i++) {
      paths.push(this.buildArrayItemPath(arrayPath, i));
    }
    return paths;
  }
}
