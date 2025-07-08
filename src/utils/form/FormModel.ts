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
export class FormModel {
  protected fields: Map<string, FormField> = new Map();
  private listeners: Set<(fields: Map<string, FormField>) => void> = new Set();
  private fieldCache: Map<string, FormField> = new Map();

  /**
   * Creates a new FormModel instance
   * @param schema - The JSON schema to build the form from
   */
  constructor(schema: JSONSchema | JSONSchemaProperties) {
    const effectiveSchema = isJSONSchema(schema) ? schema : { type: 'object' as const, properties: schema };
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
      this.getField(path);
      FieldUpdater.updateFieldValue(this.fields, path, value);
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

}
