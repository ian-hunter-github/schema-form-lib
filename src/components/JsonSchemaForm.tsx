import React, { useState } from "react";
import type {
  JSONSchemaProperties,
  JSONValue,
  FormValue,
  InitialFieldState,
} from "../types/schema";
import { FormValidator } from "../utils/FormValidator";
import FieldRenderer from "./FieldRenderer";

type Props = {
  schema: JSONSchemaProperties;
  onSubmit?: (data: Record<string, JSONValue>) => void;
  depth?: number;
  parentId: string;
};

const JsonSchemaForm: React.FC<Props> = ({
  schema,
  onSubmit,
  depth = 0,
  parentId = "",
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
          required: field.required || false
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
      acc[key] = initialState[key].required;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const handleChange = (key: string, value: FormValue) => {
    const errors = FormValidator.validateField(
      schema,
      key,
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

    setFormData((prev) => {
      // Handle nested paths (e.g. "person.address.street")
      const keys = key.split('.');
      if (keys.length === 1) {
        return { ...prev, [key]: value };
      }

      // For nested paths, we need to deeply merge the changes
      const newData = { ...prev };
      let current: Record<string, JSONValue> = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!current[k]) {
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
    if (value === null || typeof value !== 'object') {
      return value as JSONValue;
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
            !(typeof cleaned === 'object' && Object.keys(cleaned).length === 0) &&
            !(Array.isArray(cleaned) && cleaned.length === 0)) {
          result[key] = cleaned;
        }
      }
    }
    return result;
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
      if (Object.keys(cleanedData).length > 0) {
        onSubmit(cleanedData as Record<string, JSONValue>);
      }
    }
  };

  const renderFields = (
    schema: JSONSchemaProperties,
    prefix = "",
    currentDepth = 0
  ) => {
    return Object.keys(schema).map((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const field = schema[key];
      if (field.type === "object" && field.properties) {
        currentDepth += 1;
      }

      return (
        <div key={fullKey}>
          <FieldRenderer
            name={key}
            value={formData[key]}
            schema={field}
            onChange={(value) => handleChange(key, value)}
            error={errors[key]}
            depth={currentDepth}
            parentId={parentId}
            required={requiredFields[key]}
          />
        </div>
      );
    });
  };

  return (
    <form id="form" data-testid="form" onSubmit={handleSubmit}>
      {renderFields(schema, "", depth)}
      <button type="submit">Submit</button>
    </form>
  );
};

export default JsonSchemaForm;
