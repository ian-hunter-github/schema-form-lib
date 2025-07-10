// src/hooks/useFormModel.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { FormModel } from '../utils/form/FormModel';
import type { JSONSchema, JSONSchemaProperties, JSONValue } from '../types/schema';
import type { FormField } from '../types/fields';

export interface UseFormModelOptions<T extends Record<string, JSONValue>> {
  schema: JSONSchema | JSONSchemaProperties;
  initialValues?: T;
  onUnsavedChangesWarning?: (hasChanges: boolean) => void;
  autoValidate?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormModelReturn {
  formModel: FormModel;
  fields: Map<string, FormField>;
  setValue: (path: string, value: JSONValue, shouldValidate?: boolean) => void;
  getValue: (path: string) => JSONValue | undefined;
  getField: (path: string) => FormField | undefined;
  validate: () => boolean;
  revertField: (path: string) => boolean;
  revertBranch: (branchPath: string) => boolean;
  revertAll: () => void;
  hasUnsavedChanges: boolean;
  getChangedFields: () => FormField[];
  getChangedPaths: () => string[];
  createSnapshot: () => Map<string, JSONValue>;
  restoreFromSnapshot: (snapshot: Map<string, JSONValue>) => void;
  setPristineValues: () => void;
  getChangeStatistics: () => {
    totalFields: number;
    changedFields: number;
    dirtyFields: number;
    hasUnsavedChanges: boolean;
  };
  addArrayItem: (arrayPath: string, value?: JSONValue) => string;
  removeArrayItem: (elementPath: string) => number;
  moveArrayItem: (arrayPath: string, fromIndex: number, toIndex: number) => void;
  insertArrayItem: (arrayPath: string, index: number, value?: JSONValue) => string;
  getArrayLength: (arrayPath: string) => number;
}

function flattenInitialValues(
  obj: unknown,
  parentKey = '',
  result: Record<string, JSONValue> = {}
): Record<string, JSONValue> {
  if (obj === null || obj === undefined) return result;

  if (typeof obj !== 'object') {
    if (parentKey) result[parentKey] = obj as JSONValue;
    return result;
  }

  const entries = Object.entries(obj as Record<string, unknown>);
  for (const [key, value] of entries) {
    const path = parentKey ? `${parentKey}.${key}` : key;

    if (Array.isArray(value)) {
      result[path] = value;
      value.forEach((item, index) => {
        const itemPath = `${path}.${index}`;
        if (item !== null && typeof item === 'object') {
          flattenInitialValues(item, itemPath, result);
        } else {
          result[itemPath] = item as JSONValue;
        }
      });
    } else if (value !== null && typeof value === 'object') {
      flattenInitialValues(value, path, result);
    } else {
      result[path] = value as JSONValue;
    }
  }

  return result;
}

export function useFormModel<T extends Record<string, JSONValue>>(
  options: UseFormModelOptions<T>
): UseFormModelReturn {
  const {
    schema,
    initialValues,
    onUnsavedChangesWarning,
    autoValidate = true,
    validateOnChange = false,
    validateOnBlur = true
  } = options;

  const formModelRef = useRef<FormModel | null>(null);

  if (!formModelRef.current) {
    formModelRef.current = new FormModel(schema);

    if (initialValues) {
      const flatValues = flattenInitialValues(initialValues);
      for (const [path, value] of Object.entries(flatValues)) {
        try {
          formModelRef.current.setValue(path, value);
        } catch (error) {
          console.warn(`Could not set initial value for path "${path}":`, error);
        }
      }
    }

    if (autoValidate) {
      formModelRef.current.validate();
    }
  }

  const formModel = formModelRef.current;

  const [fields, setFields] = useState<Map<string, FormField>>(formModel.getFields());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(formModel.hasUnsavedChanges());

  useEffect(() => {
    const onChange = (updatedFields: Map<string, FormField>) => {
      setFields(new Map(updatedFields));
      const hasChanges = formModel.hasUnsavedChanges();
      setHasUnsavedChanges(hasChanges);
      onUnsavedChangesWarning?.(hasChanges);
    };

    formModel.addListener(onChange);
    return () => formModel.removeListener(onChange);
  }, [formModel, onUnsavedChangesWarning]);

  const setValue = useCallback(
    (path: string, value: JSONValue, shouldValidate?: boolean) => {
      formModel.setValue(path, value);
      const doValidate = shouldValidate ?? (validateOnChange || validateOnBlur);
      if (doValidate) formModel.validate();
    },
    [formModel, validateOnChange, validateOnBlur]
  );

  const getValue = useCallback((path: string) => formModel.getField(path)?.value, [formModel]);
  const getField = useCallback((path: string) => formModel.getField(path), [formModel]);
  const validate = useCallback(() => formModel.validate(), [formModel]);
  const revertField = useCallback((path: string) => formModel.revertField(path), [formModel]);
  const revertBranch = useCallback((path: string) => formModel.revertBranch(path), [formModel]);
  const revertAll = useCallback(() => formModel.revertAll(), [formModel]);
  const getChangedFields = useCallback(() => formModel.getChangedFields(), [formModel]);
  const getChangedPaths = useCallback(() => formModel.getChangedPaths(), [formModel]);
  const createSnapshot = useCallback(() => formModel.createSnapshot(), [formModel]);
  const restoreFromSnapshot = useCallback(
    (snapshot: Map<string, JSONValue>) => formModel.restoreFromSnapshot(snapshot),
    [formModel]
  );
  const setPristineValues = useCallback(() => formModel.setPristineValues(), [formModel]);
  const getChangeStatistics = useCallback(() => formModel.getChangeStatistics(), [formModel]);

  const addArrayItem = useCallback(
    (arrayPath: string, value?: JSONValue) =>
      formModel.addValue(arrayPath, value !== undefined ? value : ''),
    [formModel]
  );

  const removeArrayItem = useCallback(
    (elementPath: string) => formModel.deleteValue(elementPath),
    [formModel]
  );

  const moveArrayItem = useCallback(
    (arrayPath: string, fromIndex: number, toIndex: number) =>
      formModel.moveArrayItem(arrayPath, fromIndex, toIndex),
    [formModel]
  );

  const insertArrayItem = useCallback(
    (arrayPath: string, index: number, value?: JSONValue) =>
      formModel.insertArrayItem(arrayPath, index, value !== undefined ? value : ''),
    [formModel]
  );

  const getArrayLength = useCallback(
    (arrayPath: string) => formModel.getArrayLength(arrayPath),
    [formModel]
  );

  return {
    formModel,
    fields,
    setValue,
    getValue,
    getField,
    validate,
    revertField,
    revertBranch,
    revertAll,
    hasUnsavedChanges,
    getChangedFields,
    getChangedPaths,
    createSnapshot,
    restoreFromSnapshot,
    setPristineValues,
    getChangeStatistics,
    addArrayItem,
    removeArrayItem,
    moveArrayItem,
    insertArrayItem,
    getArrayLength
  };
}

// Warn user on browser unload if unsaved changes exist
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);
}
