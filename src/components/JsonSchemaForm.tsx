import React, { useState } from "react";
import type {
  JSONSchemaProperties,
  JSONValue,
  FormValue,
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
  ): Record<string, JSONValue> => {
    console.log(
      `Building initial state for key: ${schema}`
    );

    return Object.keys(schema).reduce((acc, key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const field = schema[key];
      const def = field.default;

      if (field.type === "object" && field.properties) {
        acc[key] = buildInitialState(field.properties, fullKey);
      } else if (field.type === "array") {
        acc[key] = def ?? [""];
      } else {
        acc[key] = def ?? (field.type === "boolean" ? false : "");
      }
      return acc;
    }, {} as Record<string, JSONValue>);
  };

  const initialState = buildInitialState(schema);
  const [formData, setFormData] = useState<Record<string, JSONValue>>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});


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
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

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
      onSubmit(formData);
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
