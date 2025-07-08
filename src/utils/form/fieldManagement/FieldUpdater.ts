import type { JSONValue } from '../../../types/schema';
import type { FormField } from '../../../types/fields';
import { PathResolver } from '../pathResolution/PathResolver';
import { FieldInitializer } from '../fieldCreation/FieldInitializer';
import { isJSONObject } from '../schemaUtils';

export class FieldUpdater {
  static updateFieldValue(
    fields: Map<string, FormField>,
    path: string,
    value: JSONValue
  ): void {
    const field = fields.get(path);
    if (!field) return;

    FieldInitializer.updateFieldValue(field, value);
    
    // Update parent structures
    this.updateParentStructures(fields, path, value);
    
    // Propagate dirty state up the hierarchy
    this.propagateDirtyState(fields, path);
    
    // Propagate hasChanges state up the hierarchy
    this.propagateChangesState(fields, path);
  }

  private static updateParentStructures(
    fields: Map<string, FormField>,
    path: string,
    value: JSONValue
  ): void {
    if (!PathResolver.isNestedPath(path)) return;

    const parentPath = PathResolver.getParentPath(path);
    const propertyName = PathResolver.getPropertyName(path);
    const parentField = fields.get(parentPath);

    if (!parentField) return;

    // Update parent array/object structure
    if (Array.isArray(parentField.value)) {
      const index = PathResolver.getArrayIndex(propertyName);
      if (index >= 0 && index < parentField.value.length) {
        parentField.value[index] = value;
      }
    } else if (isJSONObject(parentField.value)) {
      (parentField.value as Record<string, JSONValue>)[propertyName] = value;
    }

    // Recursively update all ancestors in the hierarchy
    this.updateParentStructures(fields, parentPath, parentField.value);
  }

  private static propagateDirtyState(
    fields: Map<string, FormField>,
    path: string
  ): void {
    let currentPath = path;
    const changedPaths = new Set<string>();

    while (PathResolver.isNestedPath(currentPath)) {
      currentPath = PathResolver.getParentPath(currentPath);
      const parentField = fields.get(currentPath);
      
      if (parentField && !changedPaths.has(currentPath)) {
        FieldInitializer.markFieldDirty(parentField);
        changedPaths.add(currentPath);
      }
    }
  }

  private static propagateChangesState(
    fields: Map<string, FormField>,
    path: string
  ): void {
    let currentPath = path;
    const changedPaths = new Set<string>();

    while (PathResolver.isNestedPath(currentPath)) {
      currentPath = PathResolver.getParentPath(currentPath);
      const parentField = fields.get(currentPath);
      
      if (parentField && !changedPaths.has(currentPath)) {
        // Update parent's hasChanges flag based on comparison with pristine value
        parentField.hasChanges = !FieldInitializer.valuesEqual(
          parentField.value, 
          parentField.pristineValue
        );
        parentField.lastModified = new Date();
        changedPaths.add(currentPath);
      }
    }
  }

  static clearAllErrors(fields: Map<string, FormField>): void {
    for (const field of fields.values()) {
      FieldInitializer.clearFieldErrors(field);
    }
  }

  static applyValidationErrors(
    fields: Map<string, FormField>,
    errors: Record<string, string[]>
  ): void {
    // First clear all existing errors
    this.clearAllErrors(fields);

    // Apply new errors
    for (const [path, fieldErrors] of Object.entries(errors)) {
      const field = fields.get(path);
      if (field) {
        FieldInitializer.setFieldErrors(field, fieldErrors);
        
        // Propagate error counts up the hierarchy
        this.propagateErrorCounts(fields, path, fieldErrors.length);
      }
    }
  }

  private static propagateErrorCounts(
    fields: Map<string, FormField>,
    path: string,
    errorCount: number
  ): void {
    let currentPath = path;

    while (PathResolver.isNestedPath(currentPath)) {
      currentPath = PathResolver.getParentPath(currentPath);
      const parentField = fields.get(currentPath);
      
      if (parentField) {
        parentField.errorCount += errorCount;
        // Add unique errors to parent (avoid duplicates)
        const field = fields.get(path);
        if (field) {
          parentField.errors = [...new Set([...parentField.errors, ...field.errors])];
        }
      }
    }
  }

  static resetFieldState(field: FormField): void {
    field.dirty = false;
    field.dirtyCount = 0;
    FieldInitializer.clearFieldErrors(field);
  }

  static resetAllFieldStates(fields: Map<string, FormField>): void {
    for (const field of fields.values()) {
      this.resetFieldState(field);
    }
  }
}
