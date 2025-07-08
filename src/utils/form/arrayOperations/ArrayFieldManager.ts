import type { JSONValue } from '../../../types/schema';
import type { FormField } from '../../../types/fields';
import { ArrayFieldCreator } from '../fieldCreation/ArrayFieldCreator';
import { PathResolver } from '../pathResolution/PathResolver';

export class ArrayFieldManager {
  static addItem(
    fields: Map<string, FormField>,
    arrayPath: string,
    value: JSONValue,
    notifyListeners?: () => void
  ): string {
    const newItemPath = ArrayFieldCreator.addArrayItem(fields, arrayPath, value);
    
    if (notifyListeners) {
      notifyListeners();
    }
    
    return newItemPath;
  }

  static removeItem(
    fields: Map<string, FormField>,
    elementPath: string,
    notifyListeners?: () => void
  ): number {
    const pathSegments = PathResolver.parsePath(elementPath);
    const index = parseInt(pathSegments[pathSegments.length - 1], 10);
    const arrayPath = PathResolver.getParentPath(elementPath);

    if (isNaN(index)) {
      throw new Error(`Invalid array element path: ${elementPath}`);
    }

    ArrayFieldCreator.removeArrayItem(fields, arrayPath, index);
    
    const arrayField = fields.get(arrayPath);
    const newLength = Array.isArray(arrayField?.value) ? arrayField.value.length : 0;
    
    if (notifyListeners) {
      notifyListeners();
    }
    
    return newLength;
  }

  static moveItem(
    fields: Map<string, FormField>,
    arrayPath: string,
    fromIndex: number,
    toIndex: number,
    notifyListeners?: () => void
  ): void {
    const arrayField = fields.get(arrayPath);
    if (!arrayField || !Array.isArray(arrayField.value)) {
      throw new Error(`Cannot move item in non-array field at path: ${arrayPath}`);
    }

    if (fromIndex < 0 || fromIndex >= arrayField.value.length ||
        toIndex < 0 || toIndex >= arrayField.value.length) {
      throw new Error(`Invalid indices for move operation: ${fromIndex} -> ${toIndex}`);
    }

    // Move the item in the array
    const [movedItem] = arrayField.value.splice(fromIndex, 1);
    arrayField.value.splice(toIndex, 0, movedItem);

    // Update all field paths affected by the move
    this.updateFieldPathsAfterMove(fields, arrayPath, fromIndex, toIndex);

    if (notifyListeners) {
      notifyListeners();
    }
  }

  private static updateFieldPathsAfterMove(
    fields: Map<string, FormField>,
    arrayPath: string,
    fromIndex: number,
    toIndex: number
  ): void {
    const fieldsToUpdate = new Map<string, FormField>();
    const fieldsToRemove: string[] = [];

    // Determine the range of indices that need updating
    const minIndex = Math.min(fromIndex, toIndex);
    const maxIndex = Math.max(fromIndex, toIndex);

    for (const [path, field] of fields) {
      if (path.startsWith(arrayPath + '.')) {
        const relativePath = path.substring(arrayPath.length + 1);
        const firstSegment = relativePath.split('.')[0];
        const currentIndex = parseInt(firstSegment, 10);
        
        if (!isNaN(currentIndex) && currentIndex >= minIndex && currentIndex <= maxIndex) {
          let newIndex: number;
          
          if (currentIndex === fromIndex) {
            newIndex = toIndex;
          } else if (fromIndex < toIndex && currentIndex > fromIndex && currentIndex <= toIndex) {
            newIndex = currentIndex - 1;
          } else if (fromIndex > toIndex && currentIndex >= toIndex && currentIndex < fromIndex) {
            newIndex = currentIndex + 1;
          } else {
            continue; // No change needed
          }
          
          const newPath = path.replace(
            `${arrayPath}.${currentIndex}`,
            `${arrayPath}.${newIndex}`
          );
          
          fieldsToUpdate.set(newPath, {
            ...field,
            path: newPath
          });
          fieldsToRemove.push(path);
        }
      }
    }

    // Remove old fields and add updated ones
    for (const path of fieldsToRemove) {
      fields.delete(path);
    }
    for (const [path, field] of fieldsToUpdate) {
      fields.set(path, field);
    }
  }

  static insertItem(
    fields: Map<string, FormField>,
    arrayPath: string,
    index: number,
    value: JSONValue,
    notifyListeners?: () => void
  ): string {
    const arrayField = fields.get(arrayPath);
    if (!arrayField || !Array.isArray(arrayField.value)) {
      throw new Error(`Cannot insert item in non-array field at path: ${arrayPath}`);
    }

    if (index < 0 || index > arrayField.value.length) {
      throw new Error(`Invalid index for insert operation: ${index}`);
    }

    // Insert the item in the array
    arrayField.value.splice(index, 0, value);

    // Shift all subsequent field paths
    this.shiftFieldPathsAfterInsert(fields, arrayPath, index);

    // Create field for the new item
    const newItemPath = `${arrayPath}.${index}`;
    const itemSchema = arrayField.schema.items;
    if (itemSchema) {
      ArrayFieldCreator.addArrayItem(fields, arrayPath, value);
    }

    if (notifyListeners) {
      notifyListeners();
    }

    return newItemPath;
  }

  private static shiftFieldPathsAfterInsert(
    fields: Map<string, FormField>,
    arrayPath: string,
    insertIndex: number
  ): void {
    const fieldsToUpdate = new Map<string, FormField>();
    const fieldsToRemove: string[] = [];

    for (const [path, field] of fields) {
      if (path.startsWith(arrayPath + '.')) {
        const relativePath = path.substring(arrayPath.length + 1);
        const firstSegment = relativePath.split('.')[0];
        const currentIndex = parseInt(firstSegment, 10);
        
        if (!isNaN(currentIndex) && currentIndex >= insertIndex) {
          const newIndex = currentIndex + 1;
          const newPath = path.replace(
            `${arrayPath}.${currentIndex}`,
            `${arrayPath}.${newIndex}`
          );
          
          fieldsToUpdate.set(newPath, {
            ...field,
            path: newPath
          });
          fieldsToRemove.push(path);
        }
      }
    }

    // Remove old fields and add updated ones
    for (const path of fieldsToRemove) {
      fields.delete(path);
    }
    for (const [path, field] of fieldsToUpdate) {
      fields.set(path, field);
    }
  }

  static getArrayLength(fields: Map<string, FormField>, arrayPath: string): number {
    const arrayField = fields.get(arrayPath);
    if (!arrayField || !Array.isArray(arrayField.value)) {
      return 0;
    }
    return arrayField.value.length;
  }

  static isValidArrayIndex(fields: Map<string, FormField>, arrayPath: string, index: number): boolean {
    const length = this.getArrayLength(fields, arrayPath);
    return index >= 0 && index < length;
  }
}
