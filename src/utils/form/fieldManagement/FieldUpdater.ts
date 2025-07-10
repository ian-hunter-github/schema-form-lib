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
    console.log(`[FieldUpdater] Updating field ${path} with value:`, value);
    const field = fields.get(path);
    if (!field) {
      console.warn(`[FieldUpdater] Field not found at path: ${path}`);
      return;
    }

    const oldValue = field.value;
    FieldInitializer.updateFieldValue(field, value);
    console.log(`[FieldUpdater] Field ${path} updated from ${oldValue} to ${field.value}`);
    
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
        // Error count is already set by FieldInitializer.setFieldErrors
        // No need to set it again here
      }
    }

    // Propagate error counts up the hierarchy
    for (const [path, field] of fields) {
      if (field.errorCount > 0) {
        this.propagateErrorCounts(fields, path);
      }
    }
  }

  private static propagateErrorCounts(
    fields: Map<string, FormField>,
    path: string
  ): void {
    let currentPath = path;
    const updatedPaths = new Set<string>();

    while (PathResolver.isNestedPath(currentPath)) {
      currentPath = PathResolver.getParentPath(currentPath);
      const parentField = fields.get(currentPath);
      
      if (parentField && !updatedPaths.has(currentPath)) {
        // Aggregate error counts from all child fields
        parentField.errorCount = this.calculateChildErrorCount(fields, currentPath);
        updatedPaths.add(currentPath);
      }
    }
  }

  private static calculateChildErrorCount(
    fields: Map<string, FormField>,
    parentPath: string
  ): number {
    const parentField = fields.get(parentPath);
    if (!parentField) return 0;

    // For objects/arrays, we want to count their own errors only if they are required
    // and have explicit validation errors (not just from children)
    if (parentField.schema.type === 'object' || parentField.schema.type === 'array') {
      if (parentField.required && parentField.errors.length > 0) {
        return parentField.errorCount;
      }
      
      // Count direct children errors (no dots in remaining path)
      let errorCount = 0;
      for (const [path, field] of fields) {
        if (path.startsWith(`${parentPath}.`)) {
          const childPath = path.slice(parentPath.length + 1);
          if (!childPath.includes('.') && field.errorCount > 0) {
            errorCount += field.errorCount;
          }
        }
      }
      
      return errorCount;
    }

    // For other field types, count errors from the deepest level only
    let deepestLevel = 0;
    let deepestErrorCount = 0;

    for (const [path, field] of fields) {
      if (path.startsWith(`${parentPath}.`)) {
        const relativePath = path.slice(parentPath.length + 1);
        const nestingLevel = relativePath.split('.').length;
        
        if (field.errorCount > 0) {
          if (nestingLevel > deepestLevel) {
            deepestLevel = nestingLevel;
            deepestErrorCount = field.errorCount;
          } else if (nestingLevel === deepestLevel) {
            deepestErrorCount += field.errorCount;
          }
        }
      }
    }

    return deepestErrorCount;
  }

  private static hasChildWithErrors(
    fields: Map<string, FormField>,
    path: string
  ): boolean {
    for (const [childPath, field] of fields) {
      if (childPath.startsWith(`${path}.`) && field.errorCount > 0) {
        return true;
      }
    }
    return false;
  }

  private static hasParentWithErrors(
    fields: Map<string, FormField>,
    path: string
  ): boolean {
    let currentPath = path;
    while (PathResolver.isNestedPath(currentPath)) {
      currentPath = PathResolver.getParentPath(currentPath);
      const parentField = fields.get(currentPath);
      if (parentField && parentField.errorCount > 0) {
        return true;
      }
    }
    return false;
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
