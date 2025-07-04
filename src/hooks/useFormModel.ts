import { useState, useEffect, useCallback, useRef } from 'react';
import { FormModel } from '../utils/form/FormModel';
import type { JSONSchema, JSONSchemaProperties, JSONValue } from '../types/schema';
import type { FormField } from '../utils/form/types';

export interface UseFormModelOptions {
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
  // Array operations
  addArrayItem: (arrayPath: string, value?: JSONValue) => string;
  removeArrayItem: (elementPath: string) => number;
  moveArrayItem: (arrayPath: string, fromIndex: number, toIndex: number) => void;
  insertArrayItem: (arrayPath: string, index: number, value?: JSONValue) => string;
  getArrayLength: (arrayPath: string) => number;
}

export function useFormModel(
  schema: JSONSchema | JSONSchemaProperties,
  options: UseFormModelOptions = {}
): UseFormModelReturn {
  const { 
    onUnsavedChangesWarning, 
    autoValidate = true,
    validateOnChange = false,
    validateOnBlur = true
  } = options;
  
  // Create FormModel instance (only once)
  const formModelRef = useRef<FormModel | null>(null);
  if (!formModelRef.current) {
    formModelRef.current = new FormModel(schema);
  }
  const formModel = formModelRef.current;

  // State for reactive updates
  const [fields, setFields] = useState<Map<string, FormField>>(() => formModel.getFields());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(() => formModel.hasUnsavedChanges());

  // Set up reactive listener
  useEffect(() => {
    const handleFieldsChange = (updatedFields: Map<string, FormField>) => {
      setFields(new Map(updatedFields));
      const hasChanges = formModel.hasUnsavedChanges();
      setHasUnsavedChanges(hasChanges);
      
      // Notify about unsaved changes
      if (onUnsavedChangesWarning) {
        onUnsavedChangesWarning(hasChanges);
      }
    };

    formModel.addListener(handleFieldsChange);
    
    // Initial validation if auto-validate is enabled
    if (autoValidate) {
      formModel.validate();
    }

    return () => {
      formModel.removeListener(handleFieldsChange);
    };
  }, [formModel, onUnsavedChangesWarning, autoValidate]);

  // Enhanced setValue with validation options
  const setValue = useCallback((path: string, value: JSONValue, shouldValidate?: boolean) => {
    formModel.setValue(path, value);
    
    // Determine if we should validate
    const doValidate = shouldValidate !== undefined 
      ? shouldValidate 
      : (validateOnChange || validateOnBlur);
    
    if (doValidate) {
      formModel.validate();
    }
  }, [formModel, validateOnChange, validateOnBlur]);

  // Convenience methods
  const getValue = useCallback((path: string) => {
    const field = formModel.getField(path);
    return field?.value;
  }, [formModel]);

  const getField = useCallback((path: string) => {
    return formModel.getField(path);
  }, [formModel]);

  const validate = useCallback(() => {
    return formModel.validate();
  }, [formModel]);

  const revertField = useCallback((path: string) => {
    return formModel.revertField(path);
  }, [formModel]);

  const revertBranch = useCallback((branchPath: string) => {
    return formModel.revertBranch(branchPath);
  }, [formModel]);

  const revertAll = useCallback(() => {
    formModel.revertAll();
  }, [formModel]);

  const getChangedFields = useCallback(() => formModel.getChangedFields(), [formModel]);
  const getChangedPaths = useCallback(() => formModel.getChangedPaths(), [formModel]);

  const createSnapshot = useCallback(() => {
    return formModel.createSnapshot();
  }, [formModel]);

  const restoreFromSnapshot = useCallback((snapshot: Map<string, JSONValue>) => {
    formModel.restoreFromSnapshot(snapshot);
  }, [formModel]);

  const setPristineValues = useCallback(() => {
    formModel.setPristineValues();
  }, [formModel]);

  const getChangeStatistics = useCallback(() => {
    return formModel.getChangeStatistics();
  }, [formModel]);

  // Array operations
  const addArrayItem = useCallback((arrayPath: string, value?: JSONValue) => {
    const defaultValue = value !== undefined ? value : '';
    return formModel.addValue(arrayPath, defaultValue);
  }, [formModel]);

  const removeArrayItem = useCallback((elementPath: string) => {
    return formModel.deleteValue(elementPath);
  }, [formModel]);

  const moveArrayItem = useCallback((arrayPath: string, fromIndex: number, toIndex: number) => {
    formModel.moveArrayItem(arrayPath, fromIndex, toIndex);
  }, [formModel]);

  const insertArrayItem = useCallback((arrayPath: string, index: number, value?: JSONValue) => {
    const defaultValue = value !== undefined ? value : '';
    return formModel.insertArrayItem(arrayPath, index, defaultValue);
  }, [formModel]);

  const getArrayLength = useCallback((arrayPath: string) => {
    return formModel.getArrayLength(arrayPath);
  }, [formModel]);

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

// Hook for browser navigation warnings
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}
