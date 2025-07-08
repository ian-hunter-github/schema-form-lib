import { useState, useEffect, useCallback, useRef } from 'react';
import { FormModel } from '../utils/form/FormModel';
import type { JSONSchema, JSONSchemaProperties, JSONValue } from '../types/schema';
import type { FormField } from '../types/fields';

export interface UseFormBufferOptions {
  onUnsavedChangesWarning?: (hasChanges: boolean) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export interface UseFormBufferReturn {
  formModel: FormModel;
  fields: Map<string, FormField>;
  setValue: (path: string, value: JSONValue) => void;
  revertField: (path: string) => boolean;
  revertBranch: (branchPath: string) => boolean;
  revertAll: () => void;
  hasUnsavedChanges: boolean;
  getChangedFields: () => FormField[];
  getChangedPaths: () => string[];
  createSnapshot: () => Map<string, JSONValue>;
  restoreFromSnapshot: (snapshot: Map<string, JSONValue>) => void;
  setPristineValues: () => void;
  validate: () => boolean;
  getChangeStatistics: () => {
    totalFields: number;
    changedFields: number;
    dirtyFields: number;
    hasUnsavedChanges: boolean;
  };
}

export function useFormBuffer(
  schema: JSONSchema | JSONSchemaProperties,
  options: UseFormBufferOptions = {}
): UseFormBufferReturn {
  const { onUnsavedChangesWarning, autoSave = false, autoSaveDelay = 1000 } = options;
  
  // Create FormModel instance (only once)
  const formModelRef = useRef<FormModel | null>(null);
  if (!formModelRef.current) {
    formModelRef.current = new FormModel(schema);
  }
  const formModel = formModelRef.current;

  // State for fields and change tracking
  const [fields, setFields] = useState<Map<string, FormField>>(() => formModel.getFields());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(() => formModel.hasUnsavedChanges());

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Update fields when FormModel changes
  useEffect(() => {
    const handleFieldsChange = (updatedFields: Map<string, FormField>) => {
      setFields(new Map(updatedFields));
      const hasChanges = formModel.hasUnsavedChanges();
      setHasUnsavedChanges(hasChanges);
      
      // Notify about unsaved changes
      if (onUnsavedChangesWarning) {
        onUnsavedChangesWarning(hasChanges);
      }

      // Handle auto-save
      if (autoSave && hasChanges) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(() => {
          // Auto-save logic would go here
          // For now, we just set pristine values to simulate a save
          formModel.setPristineValues();
        }, autoSaveDelay);
      }
    };

    formModel.addListener(handleFieldsChange);
    
    return () => {
      formModel.removeListener(handleFieldsChange);
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formModel, onUnsavedChangesWarning, autoSave, autoSaveDelay]);

  // Memoized handlers
  const setValue = useCallback((path: string, value: JSONValue) => {
    formModel.setValue(path, value);
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

  const validate = useCallback(() => {
    return formModel.validate();
  }, [formModel]);

  const getChangeStatistics = useCallback(() => {
    return formModel.getChangeStatistics();
  }, [formModel]);

  return {
    formModel,
    fields,
    setValue,
    revertField,
    revertBranch,
    revertAll,
    hasUnsavedChanges,
    getChangedFields,
    getChangedPaths,
    createSnapshot,
    restoreFromSnapshot,
    setPristineValues,
    validate,
    getChangeStatistics
  };
}

// Hook for navigation warnings
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

// Hook for keyboard shortcuts (Ctrl+Z for undo, etc.)
export function useFormKeyboardShortcuts(
  revertAll: () => void,
  createSnapshot: () => Map<string, JSONValue>,
  restoreFromSnapshot: (snapshot: Map<string, JSONValue>) => void
) {
  const snapshotHistoryRef = useRef<Map<string, JSONValue>[]>([]);
  const currentSnapshotIndexRef = useRef(-1);

  const saveSnapshot = useCallback(() => {
    const snapshot = createSnapshot();
    const history = snapshotHistoryRef.current;
    
    // Remove any snapshots after current index (when creating new branch)
    history.splice(currentSnapshotIndexRef.current + 1);
    
    // Add new snapshot
    history.push(snapshot);
    currentSnapshotIndexRef.current = history.length - 1;
    
    // Limit history size
    if (history.length > 50) {
      history.shift();
      currentSnapshotIndexRef.current--;
    }
  }, [createSnapshot]);

  const undo = useCallback(() => {
    const history = snapshotHistoryRef.current;
    if (currentSnapshotIndexRef.current > 0) {
      currentSnapshotIndexRef.current--;
      const snapshot = history[currentSnapshotIndexRef.current];
      restoreFromSnapshot(snapshot);
    }
  }, [restoreFromSnapshot]);

  const redo = useCallback(() => {
    const history = snapshotHistoryRef.current;
    if (currentSnapshotIndexRef.current < history.length - 1) {
      currentSnapshotIndexRef.current++;
      const snapshot = history[currentSnapshotIndexRef.current];
      restoreFromSnapshot(snapshot);
    }
  }, [restoreFromSnapshot]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            if (event.shiftKey) {
              event.preventDefault();
              redo();
            } else {
              event.preventDefault();
              undo();
            }
            break;
          case 'y':
            event.preventDefault();
            redo();
            break;
          case 'r':
            if (event.altKey) {
              event.preventDefault();
              revertAll();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, revertAll]);

  return { saveSnapshot, undo, redo };
}
