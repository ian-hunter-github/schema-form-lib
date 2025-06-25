import type { JSONSchemaProperties, JSONSchema, JSONValue, FormValue } from '../../types/schema';
import { isJSONSchema } from './schemaUtils';
import type { FormField } from './types';
import { ValueConverter } from './valueHandling/ValueConverter';
import { FieldCreatorFactory } from "./fieldCreation/FieldCreatorFactory";
import { DynamicFieldResolver } from "./fieldManagement/DynamicFieldResolver";
import { FieldUpdater } from "./fieldManagement/FieldUpdater";
import { ArrayFieldManager } from "./arrayOperations/ArrayFieldManager";
import { FormValidator } from "./FormValidator/FormValidator";
import { BufferingManager } from "./BufferingManager";

export class FormModel {
  protected fields: Map<string, FormField> = new Map();
  private listeners: Set<(fields: Map<string, FormField>) => void> = new Set();

  constructor(schema: JSONSchema | JSONSchemaProperties) {
    const effectiveSchema = isJSONSchema(schema) ? schema : { type: 'object' as const, properties: schema };
    this.buildForm(effectiveSchema);
  }

  private buildForm(schema: JSONSchema): void {
    this.fields = new Map();
    FieldCreatorFactory.createFieldsForSchema(this.fields, "", schema);
    this.notifyListeners();
  }

  public getField(path: string): FormField | undefined {
    console.log('[FormModel.getField] Starting for path:', path);
    const field = DynamicFieldResolver.resolveField(this.fields, path);
    console.log('[FormModel.getField] Result:', field ? 'found' : 'not found');
    return field;
  }

  public getFields(): Map<string, FormField> {
    return new Map(this.fields);
  }

  public setValue(path: string, value: JSONValue): void {
    // Ensure the field exists (create it dynamically if needed)
    const field = this.getField(path);
    if (!field) {
      // Try to create the field path dynamically
      const createdField = DynamicFieldResolver.resolveField(this.fields, path);
      if (!createdField) {
        console.warn(`Could not create field at path: ${path}`);
        return;
      }
    }

    FieldUpdater.updateFieldValue(this.fields, path, value);
    this.notifyListeners();
  }

  public validate(): boolean {
    const errors = FormValidator.validateAll(this.fields);
    const isValid = Object.keys(errors).length === 0;

    FieldUpdater.applyValidationErrors(this.fields, errors);

    console.log('Validation results:', {
      isValid,
      errors: Object.fromEntries(Object.entries(errors).filter(([, e]) => e.length > 0))
    });

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
    for (const listener of this.listeners) {
      listener(this.fields);
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

  // Keep the convertFormValue method for backward compatibility
  private convertFormValue(value: FormValue): JSONValue {
    return ValueConverter.convertFormValue(value);
  }
}
