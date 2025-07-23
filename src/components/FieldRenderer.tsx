import React, { memo } from "react";
import type { FormField } from "../types/fields";
import type { FormModel } from "../utils/form/FormModel";
import type { JSONValue } from "../types/schema";

/**
 * Renders the appropriate field component based on the field's schema type.
 * Handles all field types including primitives, arrays, objects, enums, and oneOf fields.
 * Uses lazy loading for complex field types to optimize bundle size.
 */
import StringField from "./fields/StringField";
import NumberField from "./fields/NumberField";
import BooleanField from "./fields/BooleanField";
import EnumField from "./fields/EnumField";
import ArrayOfPrimitiveField from "./fields/ArrayOfPrimitiveField";
import ArrayOfObjectsField from "./fields/ArrayOfObjectsField";
import { OneOfField } from "./fields/OneOfField/OneOfField";
import ColorField from "./fields/ColorField/ColorField";

interface FieldRendererProps {
  /** The form field to render */
  field: FormField;
  /** The form model instance for field operations */
  formModel: FormModel;
  /**
   * Callback when field value changes
   * @param value - The new field value
   * @param shouldValidate - Whether to trigger validation after change
   */
  onChange: (value: JSONValue, shouldValidate?: boolean) => void;
  /** Whether to show field descriptions (default: true) */
  showDescriptions?: boolean;
  /** The nesting depth of the field (used for styling) */
  nestingDepth: number;
}

/**
 * FieldRenderer component - dynamically selects and renders the appropriate field component
 * based on the field's schema definition.
 *
 * @example
 * // Basic usage
 * <FieldRenderer
 *   field={field}
 *   formModel={formModel}
 *   onChange={(value) => console.log(value)}
 * />
 */
const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  formModel,
  onChange,
  showDescriptions = true,
  nestingDepth,
}) => {
  // Handle oneOf fields first (highest priority)
  if (field.schema.oneOf) {
    return (
      <OneOfField
        schema={field.schema}
        path={field.path}Í
        onChange={(_path: string, value: unknown) =>
          onChange(value as JSONValue)
        }
      />
    );
  }

  // Handle enum fields (second priority)
  if (field.schema.enum) {
    return (
      <EnumField
        field={field}
        formModel={formModel}
        onChange={onChange}
        showDescriptions={showDescriptions}
      />
    );
  }

  // Handle object fields - lazy loaded to avoid circular dependencies
  // and reduce initial bundle size
  if (field.schema.properties || field.schema.type === "object") {
    // Create a lazy component that imports ObjectField only when needed
    const ObjectFieldLazy = React.lazy(() => import("./fields/ObjectField"));
    return (
      <React.Suspense fallback={null}>
        {" "}
        {/* Empty fallback prevents flash of content */}
        <ObjectFieldLazy
          field={field}
          formModel={formModel}
          onChange={onChange}
          nestingDepth={nestingDepth+1}
        />
      </React.Suspense>
    );
  }

  // Handle primitive types (fallback for simple field types)
  const fieldType =
    field.schema.type === "integer" ? "number" : field.schema.type;
  const itemSchema = field.schema.items;

  switch (fieldType) {
    case "string":
      if (field.schema.format === "color") {
        return <ColorField field={field} onChange={onChange} />;
      }
      return (
        <StringField
          field={field}
          formModel={formModel}
          onChange={onChange}
          showDescriptions={showDescriptions}
        />
      );
    case "number":
      return (
        <NumberField
          field={field}
          formModel={formModel}
          onChange={onChange}
          showDescriptions={showDescriptions}
        />
      );
    case "boolean":
      return (
        <BooleanField
          field={field}
          formModel={formModel}
          onChange={onChange}
          showDescriptions={showDescriptions}
        />
      );
    case "array":
      // Check if the array contains objects or primitives
      if (itemSchema && itemSchema.type === "object" && itemSchema.properties) {
        return (
          <ArrayOfObjectsField
            field={field}
            formModel={formModel}
            onChange={onChange}
            nestingDepth={nestingDepth+1}
          />
        );
      } else {
        return (
          <ArrayOfPrimitiveField
            field={field}
            formModel={formModel}
            onChange={onChange}
            nestingDepth={nestingDepth+1}
          />
        );
      }
    default:
      return (
        <div id={`error-${field.path}`} style={{ color: "red" }}>
          Unsupported field type: {field.schema.type}
        </div>
      );
  }
};

const areEqual = (
  prevProps: FieldRendererProps,
  nextProps: FieldRendererProps
) => {
  return (
    prevProps.field === nextProps.field &&
    prevProps.formModel === nextProps.formModel &&
    prevProps.onChange === nextProps.onChange
  );
};

export default memo(FieldRenderer, areEqual);
