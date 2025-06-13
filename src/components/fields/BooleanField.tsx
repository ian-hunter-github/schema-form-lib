import React from "react";
import type { FieldProps } from "../../types/schema";

const BooleanField: React.FC<FieldProps> = ({
  name,
  value,
  schema,
  onChange,
  error,
  parentId,
}) => {

  const fieldId = parentId ? parentId + "." + name : name;

  return (
    <>
      {schema.description && (
        <div data-testid={`${fieldId}-description`}>{schema.description}</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          id={fieldId}
          data-testid={fieldId}
          type="checkbox"
          checked={value as boolean}
          disabled={schema.readOnly}
          onChange={(e) => onChange(e.target.checked)}
        />
        <label htmlFor={fieldId} data-testid={`${fieldId}-label`}>
          {schema.title || name}
        </label>
      </div>
      {error && (
        <div data-testid={`${fieldId}-error`} style={{ color: "red" }}>
          {error}
        </div>
      )}
    </>
  );
};

export default BooleanField;
