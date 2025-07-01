import React from "react";
import type { FormField } from "../utils/formModel/types";
import type { FormModel } from "../utils/formModel/FormModel";
import type { JSONValue } from "../types/schema";
import StringField from "./fields/StringField";
import NumberField from "./fields/NumberField";
import BooleanField from "./fields/BooleanField";
import EnumField from "./fields/EnumField";
import ArrayOfPrimitiveField from "./fields/ArrayOfPrimitiveField";
import ArrayOfObjectsField from "./fields/ArrayOfObjectsField";
import { OneOfField } from "./fields/OneOfField/OneOfField";

interface FieldRendererProps {
  field: FormField;
  formModel: FormModel;
  onChange: (value: JSONValue, shouldValidate?: boolean) => void;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, formModel, onChange }) => {
  // Handle oneOf fields first
  if (field.schema.oneOf) {
    return (
      <OneOfField
        schema={field.schema}
        path={field.path}
        onChange={(_path: string, value: unknown) => onChange(value as JSONValue)}
      />
    );
  }

  // Handle enum fields
  if (field.schema.enum) {
    return <EnumField field={field} formModel={formModel} onChange={onChange} />;
  }

  // Handle object fields - import directly but avoid circular dependency
  // by not importing ObjectField at the top level
  if (field.schema.properties) {
    // Create a lazy component that imports ObjectField only when needed
    const ObjectFieldLazy = React.lazy(() => import("./fields/ObjectField"));
    return (
      <React.Suspense fallback={<div data-testid={`${field.path}-loading`}>Loading...</div>}>
        <ObjectFieldLazy field={field} formModel={formModel} onChange={onChange} />
      </React.Suspense>
    );
  }

  // Handle primitive types
  const fieldType = field.schema.type === 'integer' ? 'number' : field.schema.type;
  const itemSchema = field.schema.items;
  
  switch (fieldType) {
    case 'string':
      return <StringField field={field} formModel={formModel} onChange={onChange} />;
    case 'number':
      return <NumberField field={field} formModel={formModel} onChange={onChange} />;
    case 'boolean':
      return <BooleanField field={field} formModel={formModel} onChange={onChange} />;
    case 'array':
      // Check if the array contains objects or primitives
      if (itemSchema && itemSchema.type === 'object' && itemSchema.properties) {
        return <ArrayOfObjectsField field={field} formModel={formModel} onChange={onChange} />;
      } else {
        return <ArrayOfPrimitiveField field={field} formModel={formModel} onChange={onChange} />;
      }
    default:
      return (
        <div id={`error-${field.path}`} style={{ color: "red" }}>
          Unsupported field type: {field.schema.type}
        </div>
      );
  }
};

export default FieldRenderer;
