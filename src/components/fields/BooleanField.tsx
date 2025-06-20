import React from "react";
import type { FieldProps } from "../../types/schema";
import { capitalizeFirstLetter } from "../../utils/StringUtils";

const BooleanField: React.FC<FieldProps> = ({
  name,
  value,
  schema,
  onChange,
  error,
  domContextId,
}) => {

  const fieldId = domContextId ? domContextId + "." + name : name;

  return (
    <div className="field-container">
      <div className="checkbox-wrapper">
        <input
          id={fieldId}
          data-testid={fieldId}
          type="checkbox"
          checked={value as boolean}
          disabled={schema.readOnly}
          onChange={(e) => onChange(e.target.checked, false)}
        onBlur={(e) => onChange(e.target.checked, true)}
        />
        <label 
          htmlFor={fieldId} 
          data-testid={`${fieldId}-label`}
          className={schema.required ? 'label required' : 'label'}
        >
          {capitalizeFirstLetter(schema.title || name)}
        </label>
      </div>
      {schema.description && (
        <div id={`${fieldId}-description`} data-testid={`${fieldId}-description`}>{schema.description}</div>
      )}
      {error && (
        <div data-testid={`${fieldId}-error`} style={{ color: "red" }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default BooleanField;
