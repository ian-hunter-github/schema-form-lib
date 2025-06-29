import React, { useState } from "react";
import type {
  JSONSchemaProperties,
  JSONValue,
  FormValue,
  InitialFieldState,
} from "../types/schema";
import { FormValidator } from "../utils/formModel/FormValidator/FormValidator";
import FieldRenderer from "./FieldRenderer";
import type { FormModel } from "../utils/formModel/FormModel";

type Props = {
  schema: JSONSchemaProperties;
  onSubmit?: (data: Record<string, JSONValue>) => void;
  parentId: string;
};

const JsonSchemaForm: React.FC<Props> = ({
  schema,
  onSubmit,
}) => {

  const buildInitialState = (
    schema: JSONSchemaProperties,
    prefix = ""
  ): Record<string, InitialFieldState> => {
    return Object.keys(schema).reduce((acc, key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const field = schema[key];
      const def = field.default;

      if (field.type === "object" && field.properties) {
        // For nested objects, build the nested state but store just the values
        const nestedState = buildInitialState(field.properties, fullKey);
        acc[key] = {
          value: Object.keys(nestedState).reduce((obj, nestedKey) => {
            obj[nestedKey] = nestedState[nestedKey].value;
            return obj;
          }, {} as Record<string, JSONValue>),
          required: false // Parent object itself is never required
        };
      } else if (field.type === "array") {
        acc[key] = {
          value: def ?? [""],
          required: field.required || false
        };
      } else {
        acc[key] = {
          value: def ?? (field.type === "boolean" ? false : ""),
          required: field.required || false
        };
      }
      return acc;
    }, {} as Record<string, InitialFieldState>);
  };

  const initialState = buildInitialState(schema);
  const [formData, setFormData] = useState<Record<string, JSONValue>>(
    Object.keys(initialState).reduce((acc, key) => {
      acc[key] = initialState[key].value;
      return acc;
    }, {} as Record<string, JSONValue>)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requiredFields] = useState<Record<string, boolean>>(
    Object.keys(initialState).reduce((acc, key) => {
      acc[key] = initialState[key].required || false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const handleChange = (key: string, value: FormValue, isBlur: boolean) => {
    // Always validate required fields when empty, and validate on blur
    if (isBlur || (requiredFields[key] && (value === "" || value === null || value === undefined))) {
      // Handle nested paths (e.g. "person.firstName")
      const keys = key.split('.');
      let currentSchema = schema;
      
      // If nested path, get the nested schema for validation
      if (keys.length > 1) {
        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          if (currentSchema[k]?.type === 'object' && currentSchema[k]?.properties) {
            currentSchema = currentSchema[k].properties!;
          }
        }
      }

      const errors = FormValidator.validateField(
        currentSchema,
        key, // Use full path for validation
        value
      );
      setErrors((prev) => {
        const updated = { ...prev };
        if (errors.length > 0) {
          updated[key] = errors[0];
        } else {
          delete updated[key];
        }
        return updated;
      });
    }

    setFormData((prev) => {
      // Handle nested paths (e.g. "person.address.street")
      const keys = key.split('.');
      if (keys.length === 1) {
        return { ...prev, [key]: value };
      }

      // For nested paths, preserve existing nested values while updating just the target field
      const newData = { ...prev };
      let current: Record<string, JSONValue> = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!current[k]) {
          current[k] = {};
        } else if (typeof current[k] !== 'object' || current[k] === null) {
          // If existing value isn't an object, start fresh with empty object
          current[k] = {};
        }
        current = current[k] as Record<string, JSONValue>;
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  interface InternalStateValue {
    value: JSONValue | Record<string, unknown> | unknown[];
  }

  function isInternalStateValue(value: unknown): value is InternalStateValue {
    return typeof value === 'object' && value !== null && 'value' in value;
  }

  function cleanValue(value: unknown): JSONValue {
    if (value === null || value === undefined || typeof value !== 'object') {
      return value === undefined ? null : value as JSONValue;
    }

    if (Array.isArray(value)) {
      return value
        .map(cleanValue)
        .filter((v): v is JSONValue => v !== undefined && v !== "");
    }

    if (isInternalStateValue(value)) {
      return cleanValue(value.value);
    }

    // Handle regular objects
    const result: Record<string, JSONValue> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const cleaned = cleanValue((value as Record<string, unknown>)[key]);
        // Only include the value if it's not an empty object or array
        if (cleaned !== null && 
            !(typeof cleaned === 'object' && cleaned !== null && Object.keys(cleaned).length === 0) &&
            !(Array.isArray(cleaned) && cleaned.length === 0)) {
          result[key] = cleaned;
        }
      }
    }
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      const keys = Object.keys(result);
      return keys.length > 0 ? result : null;
    }
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = FormValidator.validateForm(formData, schema);
    const newErrors: Record<string, string> = {};

    // Flatten nested errors and keep the first error for each field
    Object.entries(validationErrors).forEach(([key, errs]) => {
      if (errs.length > 0) {
        newErrors[key] = errs[0];
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && onSubmit) {
      const cleanedData = cleanValue(formData);
      if (cleanedData && typeof cleanedData === 'object' && !Array.isArray(cleanedData)) {
        const keys = Object.keys(cleanedData);
        if (keys.length > 0) {
          onSubmit(cleanedData as Record<string, JSONValue>);
        }
      }
    }
  };

  const renderFields = (
    schema: JSONSchemaProperties,
    prefix = ""
  ) => {
    return Object.keys(schema).map((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const field = schema[key];

      return (
        <div key={fullKey}>
          <FieldRenderer
            field={{
              path: fullKey,
              value: formData[key],
              pristineValue: formData[key],
              schema: field,
              errors: errors[key] ? [errors[key]] : [],
              errorCount: errors[key] ? 1 : 0,
              required: requiredFields[key],
              dirty: false,
              dirtyCount: 0,
              hasChanges: false,
              lastModified: new Date()
            }}
            formModel={{
              getField: () => undefined,
              getFields: () => new Map(),
              setValue: () => {},
              validate: () => true,
              addListener: () => {},
              removeListener: () => {},
              // Minimal mock implementation - actual FormModel not needed here
            } as unknown as FormModel}
            onChange={(value, isBlur = false) => handleChange(key, value, isBlur)}
          />
        </div>
      );
    });
  };

  return (
    <form id="form" data-testid="form" onSubmit={handleSubmit}>
      {renderFields(schema, "")}
      <button type="submit">Submit</button>
    </form>
  );
};

export default JsonSchemaForm;
