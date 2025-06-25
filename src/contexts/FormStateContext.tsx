import React, { createContext, useContext } from 'react';
import { PathResolver } from '../utils/formModel/pathResolution/PathResolver';
import { FormValidator } from '../utils/formModel/FormValidator/FormValidator';
import type { JSONSchemaProperties, JSONValue, FormValue } from '../types/schema';

export type FormState = {
  errors: Record<string, string[]>;
  dirty: Record<string, boolean>;
};

type FormStateContextType = {
  state: FormState;
  setState: React.Dispatch<React.SetStateAction<FormState>>;
  getError: (path: string) => string[] | undefined;
  getErrorsForPathAndChildren: (path: string) => Record<string, string[]>;
  setDirty: (path: string, isDirty: boolean) => void;
  isDirty: (path: string) => boolean;
  validateField: (path: string, value: FormValue, schema: JSONSchemaProperties) => string[];
  validateForm: (formData: Record<string, JSONValue>, schema: JSONSchemaProperties) => Record<string, string[]>;
};

const FormStateContext = createContext<FormStateContextType | undefined>(undefined);

type FormStateProviderProps = {
  children: React.ReactNode;
  initialErrors?: Record<string, string[]>;
};

export const FormStateProvider: React.FC<FormStateProviderProps> = ({ children, initialErrors = {} }) => {
  const [state, setState] = React.useState<FormState>({
    errors: initialErrors,
    dirty: {}
  });
  
  const getError = (path: string) => {
    return state.errors[path]?.length ? state.errors[path] : undefined;
  };

  const getErrorsForPathAndChildren = (path: string) => {
    const errors: Record<string, string[]> = {};
    Object.entries(state.errors).forEach(([errorPath, errorMessages]) => {
      if (PathResolver.isChildPath(path, errorPath) || path === errorPath) {
        errors[errorPath] = errorMessages;
      }
    });
    return errors;
  };
  
  const setDirty = (path: string, isDirty: boolean) => {
    setState(prev => ({
      ...prev,
      dirty: { ...prev.dirty, [path]: isDirty }
    }));
  };

  const isDirty = (path: string) => !!state.dirty[path];
  
  const wrappedSetState: React.Dispatch<React.SetStateAction<FormState>> = (action) => {
    if (typeof action === 'function') {
      setState((prev) => {
        const newState = action(prev);
        return newState;
      });
    } else {
      setState(action);
    }
  };

  const validateField = (path: string, value: FormValue, schema: JSONSchemaProperties) => {
    const errors = FormValidator.validateField(schema, path, value);
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [path]: errors }
    }));
    return errors;
  };

  const validateForm = (formData: Record<string, JSONValue>, schema: JSONSchemaProperties) => {
    const errors = FormValidator.validateForm(formData, schema);
    setState(prev => ({
      ...prev,
      errors
    }));
    return errors;
  };

  return (
    <FormStateContext.Provider 
      value={{ 
        state, 
        setState: wrappedSetState, 
        getError, 
        getErrorsForPathAndChildren,
        setDirty, 
        isDirty,
        validateField,
        validateForm
      }}
    >
      {children}
    </FormStateContext.Provider>
  );
};

export const useFormState = () => {
  const context = useContext(FormStateContext);
  if (!context) {
    throw new Error('useFormState must be used within a FormStateProvider');
  }
  return context;
};
