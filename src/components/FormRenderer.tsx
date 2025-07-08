import React, { useEffect, useState } from "react";
import type { JSONValue } from "../types/schema";
import type { FormModel } from "../utils/form/FormModel";
import type { FormField } from "../types/fields";
import type { LayoutConfig } from "../types/layout";
import LayoutContainer from "./layout/LayoutContainer";

interface FormRendererProps {
  formModel: FormModel;
  onSubmit?: (data: Record<string, JSONValue>) => void;
  layoutConfig?: LayoutConfig;
}

const FormRenderer: React.FC<FormRendererProps> = ({ formModel, onSubmit, layoutConfig = { strategy: 'vertical' } }) => {
  const [fields, setFields] = useState<Map<string, FormField>>(formModel.getFields());

  useEffect(() => {
    // Validate fields that have non-undefined values on mount
    const fieldsMap = formModel.getFields();
    let hasValuesToValidate = false;
    
    for (const [path, field] of fieldsMap) {
      // Skip empty path and check for meaningful values
      if (path !== '' && field.value !== undefined && field.value !== null && field.value !== '') {
        hasValuesToValidate = true;
        break;
      }
    }
    
    if (hasValuesToValidate) {
      formModel.validate();
    }

    // Set up listener for reactive updates
    const handleFieldsChange = (updatedFields: Map<string, FormField>) => {
      setFields(new Map(updatedFields));
    };

    formModel.addListener(handleFieldsChange);

    // Cleanup listener on unmount
    return () => {
      formModel.removeListener(handleFieldsChange);
    };
  }, [formModel]);

  const handleFieldChange = (path: string, value: JSONValue) => {
    formModel.setValue(path, value);
    // Validate immediately for instant feedback
    formModel.validate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = formModel.validate();
    
    if (isValid && onSubmit) {
      // Get clean data from FormModel
      const formData: Record<string, JSONValue> = {};
      
      for (const [path, field] of fields) {
        // Only include root-level fields (no dots in path) and exclude empty path
        if (!path.includes('.') && path !== '' && field.value !== undefined && field.value !== null && field.value !== '') {
          formData[path] = field.value;
        }
      }
      
      onSubmit(formData);
    }
  };

  // Get root-level fields (fields without dots in their path and exclude empty path)
  const rootFields = Array.from(fields.entries())
    .filter(([path]) => !path.includes('.') && path !== '')
    .map(([, field]) => field);

  return (
    <form data-testid="form-renderer" onSubmit={handleSubmit}>
      <LayoutContainer
        fields={rootFields}
        formModel={formModel}
        layoutConfig={layoutConfig}
        onChange={handleFieldChange}
      />
      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </form>
  );
};

export default FormRenderer;
