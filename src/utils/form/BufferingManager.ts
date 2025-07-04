import type { JSONValue } from '../../types/schema';
import type { FormField } from './types';
import { FieldInitializer } from './fieldCreation/FieldInitializer';
import { PathResolver } from './pathResolution/PathResolver';
import { isJSONObject } from './schemaUtils';

export class BufferingManager {
  /**
   * Revert a single field to its pristine value
   */
  static revertField(fields: Map<string, FormField>, path: string): boolean {
    const field = fields.get(path);
    if (!field) {
      return false;
    }

    FieldInitializer.revertFieldValue(field);
    
    // Update parent structures with the reverted value
    this.updateParentStructures(fields, path, field.value);
    
    return true;
  }

  /**
   * Revert an entire branch (object or array) and all its children
   */
  static revertBranch(fields: Map<string, FormField>, branchPath: string): boolean {
    const branchField = fields.get(branchPath);
    if (!branchField) {
      return false;
    }

    // Find all child fields that belong to this branch
    const childPaths = this.getChildPaths(fields, branchPath);
    
    // Revert all children first
    for (const childPath of childPaths) {
      this.revertField(fields, childPath);
    }
    
    // Then revert the branch itself
    this.revertField(fields, branchPath);
    
    return true;
  }

  /**
   * Revert the entire form to pristine state
   */
  static revertAll(fields: Map<string, FormField>): void {
    for (const field of fields.values()) {
      FieldInitializer.revertFieldValue(field);
    }
    
    // Rebuild parent structures from pristine values
    this.rebuildAllParentStructures(fields);
  }

  /**
   * Check if the form has any unsaved changes
   */
  static hasUnsavedChanges(fields: Map<string, FormField>): boolean {
    for (const field of fields.values()) {
      if (field.hasChanges) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get all fields that have changes
   */
  static getChangedFields(fields: Map<string, FormField>): FormField[] {
    return Array.from(fields.values()).filter(field => field.hasChanges);
  }

  /**
   * Get all paths that have changes
   */
  static getChangedPaths(fields: Map<string, FormField>): string[] {
    return this.getChangedFields(fields).map(field => field.path);
  }

  /**
   * Create a snapshot of current form state (for advanced undo/redo)
   */
  static createSnapshot(fields: Map<string, FormField>): Map<string, JSONValue> {
    const snapshot = new Map<string, JSONValue>();
    for (const [path, field] of fields.entries()) {
      snapshot.set(path, field.value);
    }
    return snapshot;
  }

  /**
   * Restore form state from a snapshot
   */
  static restoreFromSnapshot(
    fields: Map<string, FormField>, 
    snapshot: Map<string, JSONValue>
  ): void {
    for (const [path, value] of snapshot.entries()) {
      const field = fields.get(path);
      if (field) {
        FieldInitializer.updateFieldValue(field, value);
      }
    }
    this.rebuildAllParentStructures(fields);
  }

  /**
   * Set new pristine values (useful after save operations)
   */
  static setPristineValues(fields: Map<string, FormField>): void {
    for (const field of fields.values()) {
      FieldInitializer.setPristineValue(field, field.value);
      field.dirty = false;
      field.dirtyCount = 0;
    }
  }

  /**
   * Get statistics about form changes
   */
  static getChangeStatistics(fields: Map<string, FormField>): {
    totalFields: number;
    changedFields: number;
    dirtyFields: number;
    hasUnsavedChanges: boolean;
  } {
    let changedFields = 0;
    let dirtyFields = 0;
    
    for (const field of fields.values()) {
      if (field.hasChanges) changedFields++;
      if (field.dirty) dirtyFields++;
    }
    
    return {
      totalFields: fields.size,
      changedFields,
      dirtyFields,
      hasUnsavedChanges: changedFields > 0
    };
  }

  /**
   * Private helper: Get all child paths for a given parent path
   */
  private static getChildPaths(fields: Map<string, FormField>, parentPath: string): string[] {
    const childPaths: string[] = [];
    const parentPrefix = parentPath + '.';
    
    for (const path of fields.keys()) {
      if (path.startsWith(parentPrefix)) {
        childPaths.push(path);
      }
    }
    
    return childPaths;
  }

  /**
   * Private helper: Update parent structures when a field value changes
   */
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

    // Update parent's hasChanges flag
    parentField.hasChanges = !FieldInitializer.valuesEqual(
      parentField.value, 
      parentField.pristineValue
    );

    // Recursively update all ancestors in the hierarchy
    this.updateParentStructures(fields, parentPath, parentField.value);
  }

  /**
   * Private helper: Rebuild all parent structures from current field values
   */
  private static rebuildAllParentStructures(fields: Map<string, FormField>): void {
    // Get all leaf fields (fields that don't have children)
    const leafFields = this.getLeafFields(fields);
    
    // Update parent structures starting from leaf fields
    for (const leafField of leafFields) {
      this.updateParentStructures(fields, leafField.path, leafField.value);
    }
  }

  /**
   * Private helper: Get all leaf fields (fields without children)
   */
  private static getLeafFields(fields: Map<string, FormField>): FormField[] {
    const allPaths = Array.from(fields.keys());
    const leafFields: FormField[] = [];
    
    for (const [path, field] of fields.entries()) {
      const isLeaf = !allPaths.some(otherPath => 
        otherPath !== path && otherPath.startsWith(path + '.')
      );
      
      if (isLeaf) {
        leafFields.push(field);
      }
    }
    
    return leafFields;
  }
}
