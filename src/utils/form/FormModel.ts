import type { JSONSchemaProperties, JSONSchema, JSONValue } from '../../types/schema';
import { isJSONSchema } from './schemaUtils';
import type { FormError } from './types';
import type { FormField } from '../../types/fields';

interface FormModelError extends FormError {
  path?: string;
  details?: unknown;
}
import { FieldCreatorFactory } from "./fieldCreation/FieldCreatorFactory";
import { DynamicFieldResolver } from "./fieldManagement/DynamicFieldResolver";
import { FieldUpdater } from "./fieldManagement/FieldUpdater";
import { ArrayFieldManager } from "./arrayOperations/ArrayFieldManager";
import { FormValidator } from "./FormValidator/FormValidator";
import { BufferingManager } from "./BufferingManager";

/**
 * Core form state management class that handles:
 * - Field creation and management
 * - Value updates
 * - Validation
 * - Change tracking
 * - Array operations
 */
export interface LayoutContext {
  isGrid12: boolean;
}

export class FormModel {
  layoutContext?: LayoutContext;
  protected fields: Map<string, FormField> = new Map();
  private listeners: Set<(fields: Map<string, FormField>) => void> = new Set();
  private fieldCache: Map<string, FormField> = new Map();
  private hybridMode: boolean = false;
  private dirtyFields: Set<string> = new Set();
  private changedValues: Map<string, JSONValue> = new Map();

  /**
   * Creates a new FormModel instance
   * @param schema - The JSON schema to build the form from
   */
  constructor(schema: JSONSchema | JSONSchemaProperties, options: { hybridMode?: boolean } = {}) {
    const effectiveSchema = isJSONSchema(schema) ? schema : { type: 'object' as const, properties: schema };
    this.hybridMode = options.hybridMode || false;
    this.buildForm(effectiveSchema);
  }

  private buildForm(schema: JSONSchema): void {
    this.fields = new Map();
    this.fieldCache = new Map(); // Clear cache when rebuilding form
    FieldCreatorFactory.createFieldsForSchema(this.fields, "", schema);
    this.notifyListeners();
  }

  /**
   * Gets a field by its path
   * @param path - The field path (e.g. 'user.name')
   * @returns The field or undefined if not found
   */
  public getField(path: string): FormField {
    // Check cache first
    if (this.fieldCache.has(path)) {
      return this.fieldCache.get(path)!;
    }

    const field = DynamicFieldResolver.resolveField(this.fields, path);
    if (!field) {
      throw {
        code: 'FIELD_NOT_FOUND',
        message: `Field not found at path: ${path}`,
        path
      } as FormModelError;
    }

    // Cache the resolved field
    this.fieldCache.set(path, field);
    return field;
  }

  /**
   * Gets all fields in the form
   * @returns Map of all fields (path => field)
   */
  public getFields(): Map<string, FormField> {
    return new Map(this.fields);
  }

  /**
   * Sets a field's value
   * @param path - The field path
   * @param value - The new value
   */
  public setValue(path: string, value: JSONValue): void {
    try {
      // Ensure the field exists (will throw if not found)
      const field = this.getField(path);
      const oldValue = field.value;
      FieldUpdater.updateFieldValue(this.fields, path, value);
      
      if (this.hybridMode && JSON.stringify(oldValue) !== JSON.stringify(value)) {
        this.dirtyFields.add(path);
        this.changedValues.set(path, value);
      }
      this.notifyListeners();
    } catch (error) {
      console.error(`Failed to set value for path ${path}:`, error);
      throw {
        code: 'SET_VALUE_ERROR',
        message: `Failed to set value for path ${path}`,
        path,
        details: error
      } as FormModelError;
    }
  }

  /**
   * Validates all fields in the form
   * @returns True if all fields are valid
   */
  public validate(): boolean {
    const errors = FormValidator.validateAll(this.fields);
    const isValid = Object.keys(errors).length === 0;

    FieldUpdater.applyValidationErrors(this.fields, errors);

    this.notifyListeners();
    return isValid;
  }

  public addValue(arrayPath: string, value: JSONValue): string {
    return ArrayFieldManager.addItem(
      this.fields,
      arrayPath,
      value,
      () => this.notifyListeners()
    );
  }

  public deleteValue(elementPath: string): number {
    return ArrayFieldManager.removeItem(
      this.fields,
      elementPath,
      () => this.notifyListeners()
    );
  }

  public addListener(listener: (fields: Map<string, FormField>) => void): void {
    this.listeners.add(listener);
  }

  public removeListener(listener: (fields: Map<string, FormField>) => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    // Clear cache when notifying listeners since fields may have changed
    this.fieldCache.clear();
    
    // Batch listener notifications
    const fieldsSnapshot = new Map(this.fields);
    for (const listener of this.listeners) {
      listener(fieldsSnapshot);
    }
  }

  // Additional utility methods that can be added
  public moveArrayItem(arrayPath: string, fromIndex: number, toIndex: number): void {
    ArrayFieldManager.moveItem(
      this.fields,
      arrayPath,
      fromIndex,
      toIndex,
      () => this.notifyListeners()
    );
  }

  public insertArrayItem(arrayPath: string, index: number, value: JSONValue): string {
    return ArrayFieldManager.insertItem(
      this.fields,
      arrayPath,
      index,
      value,
      () => this.notifyListeners()
    );
  }

  public getArrayLength(arrayPath: string): number {
    return ArrayFieldManager.getArrayLength(this.fields, arrayPath);
  }

  public resetForm(): void {
    FieldUpdater.resetAllFieldStates(this.fields);
    this.notifyListeners();
  }

  public clearErrors(): void {
    FieldUpdater.clearAllErrors(this.fields);
    this.notifyListeners();
  }

  // Buffering and revert methods
  public revertField(path: string): boolean {
    const success = BufferingManager.revertField(this.fields, path);
    if (success) {
      this.notifyListeners();
    }
    return success;
  }

  public revertBranch(branchPath: string): boolean {
    const success = BufferingManager.revertBranch(this.fields, branchPath);
    if (success) {
      this.notifyListeners();
    }
    return success;
  }

  public revertAll(): void {
    BufferingManager.revertAll(this.fields);
    this.notifyListeners();
  }

  public hasUnsavedChanges(): boolean {
    return BufferingManager.hasUnsavedChanges(this.fields);
  }

  public getChangedFields(): FormField[] {
    return BufferingManager.getChangedFields(this.fields);
  }

  public getChangedPaths(): string[] {
    return BufferingManager.getChangedPaths(this.fields);
  }

  public createSnapshot(): Map<string, JSONValue> {
    return BufferingManager.createSnapshot(this.fields);
  }

  public restoreFromSnapshot(snapshot: Map<string, JSONValue>): void {
    BufferingManager.restoreFromSnapshot(this.fields, snapshot);
    this.notifyListeners();
  }

  public setPristineValues(): void {
    BufferingManager.setPristineValues(this.fields);
    this.notifyListeners();
  }

  public getChangeStatistics(): {
    totalFields: number;
    changedFields: number;
    dirtyFields: number;
    hasUnsavedChanges: boolean;
  } {
    return BufferingManager.getChangeStatistics(this.fields);
  }

  /**
   * Determines if validation errors should be shown for a field
   */
  public shouldShowErrors(): boolean {
    return true; // Default to always showing errors
  }

  /**
   * Determines if dirty indicators should be shown for a field
   * @param field - Optional field to check dirty state for
   */
  public shouldShowDirty(_field?: FormField): boolean { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Field parameter is used by some implementations to make conditional decisions
    return true; // Default to always showing dirty state
  }

  /**
   * Gets all dirty fields in hybrid mode
   */
  public getDirtyFields(): string[] {
    if (this.hybridMode) {
      return Array.from(this.dirtyFields);
    }
    throw new Error('getDirtyFields() is only available in hybrid mode');
  }

  /**
   * Gets aggregated dirty state for a field and its children
   */
  public getAggregatedDirtyState(path: string): boolean {
    if (this.hybridMode) {
      return this.dirtyFields.has(path) || 
        Array.from(this.dirtyFields).some(p => p.startsWith(`${path}.`));
    }

    const field = this.fields.get(path);
    if (!field) return false;

    // Check if the field itself is dirty
    if (field.dirty) return true;

    // Check all child fields recursively
    for (const [childPath, childField] of this.fields.entries()) {
      if (childPath.startsWith(`${path}.`)) {
        if (childField.dirty) return true;
      }
    }

    return false;
  }

  /**
   * Gets all changed values (current and pristine)
   */
  public getChangedValues(): Record<string, JSONValue> {
    if (!this.hybridMode) {
      throw new Error('getChangedValues() is only available in hybrid mode');
    }
    return Object.fromEntries(this.changedValues);
  }

  /**
   * Clears all dirty states while maintaining change tracking
   */
  public clearAllDirtyStates(): void {
    for (const field of this.fields.values()) {
      field.dirty = false;
      field.dirtyCount = 0;
    }
    if (this.hybridMode) {
      this.dirtyFields.clear();
      this.changedValues.clear();
    }
    this.notifyListeners();
  }
}
