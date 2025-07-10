import React, { memo, useState } from 'react';
import type { FormField } from '../../../types/fields';
import type { FormModel } from '../../../utils/form/FormModel';
import type { JSONValue } from '../../../types/schema';
import type { LayoutConfig, JSONSchemaWithLayout } from '../../../types/layout';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import LayoutContainer from '../../layout/LayoutContainer';
import {
  StyledFieldContainer,
  StyledFieldLabel,
  StyledFieldDescription,
  StyledFieldError,
  StyledFieldHelper,
  StyledArrayHeader,
} from '../../../theme/styled';

export interface ObjectFieldProps {
  field: FormField;
  onChange: (value: JSONValue, shouldValidate?: boolean) => void;
  formModel: FormModel;
}

const ObjectField: React.FC<ObjectFieldProps> = ({ 
  field, 
  onChange, 
  formModel 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fieldId = field.path;
  const displayName = field.path.split('.').pop() || field.path;
  const hasErrors = field.errors.length > 0;
  const errorMessage = hasErrors ? field.errors[0] : undefined;

  // Get the object properties from the schema
  const properties = field.schema.properties || {};
  const propertyKeys = Object.keys(properties);

  // Helper function to get nested field from FormModel
  const getNestedField = (propertyKey: string): FormField | undefined => {
    if (!formModel) return undefined;
    const nestedPath = field.path ? `${field.path}.${propertyKey}` : propertyKey;
    return formModel.getField(nestedPath);
  };

  // Helper function to handle nested field changes
  const handleNestedChange = (path: string, value: JSONValue) => {
    formModel.setValue(path, value);
    // Propagate the change up to parent
    if (onChange) {
      onChange(field.value);
    }
  };

  // Get nested fields for layout container
  const getNestedFields = (): FormField[] => {
    const nestedFields: FormField[] = [];
    for (const propertyKey of propertyKeys) {
      const nestedField = getNestedField(propertyKey);
      if (nestedField) {
        nestedFields.push(nestedField);
      }
    }
    return nestedFields;
  };

  // Get layout configuration from schema
  const getObjectLayoutConfig = (): LayoutConfig => {
    const schema = field.schema as JSONSchemaWithLayout;
    const layoutConfig = schema['x-layout'];
    
    if (layoutConfig) {
      return {
        strategy: 'grid-12', // Default for objects
        ...layoutConfig
      };
    }
    
    // Default layout for objects
    return { strategy: 'vertical' };
  };

  return (
    <StyledFieldContainer>
      {/* Accordion Header */}
      <StyledArrayHeader 
        hasBottomBorder={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ marginBottom: isExpanded ? '0.5rem' : 0 }}
      >
        <span 
          style={{ 
            marginRight: '0.25rem',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          ▶
        </span>
        <StyledFieldLabel
          htmlFor={fieldId}
          id={`${fieldId}-label`}
          data-testid={`${fieldId}-label`}
          required={field.required}
          style={{ 
            margin: 0,
            cursor: 'pointer',
            flex: 1
          }}
        >
          {capitalizeFirstLetter(field.schema.title || displayName)}{field.required && <span style={{ color: '#dc2626' }}> *</span>}
        </StyledFieldLabel>
        
        {field.dirty && (
          <StyledFieldHelper
            id={`${fieldId}-dirty-indicator`}
            data-testid={`${fieldId}-dirty-indicator`}
            style={{ marginLeft: '0.5rem' }}
          >
            Modified
          </StyledFieldHelper>
        )}
      </StyledArrayHeader>

      {/* Accordion Content */}
      {isExpanded && (
        <div 
          style={{
            paddingLeft: '1.5rem',
            borderLeft: '2px solid #e5e7eb',
            marginLeft: '0.5rem'
          }}
        >
          {field.schema.description && (
            <StyledFieldDescription
              id={`${fieldId}-description`}
              data-testid={`${fieldId}-description`}
              style={{ marginBottom: '0.5rem' }}
            >
              {field.schema.description}
            </StyledFieldDescription>
          )}

          {/* Render nested fields using LayoutContainer */}
          {propertyKeys.length > 0 ? (
            <LayoutContainer
              fields={getNestedFields()}
              formModel={formModel}
              layoutConfig={getObjectLayoutConfig()}
              onChange={handleNestedChange}
            />
          ) : (
            <StyledFieldHelper style={{ fontStyle: 'italic' }}>
              No properties defined for this object
            </StyledFieldHelper>
          )}
        </div>
      )}

      {/* Error display */}
      {hasErrors && (
        <StyledFieldError
          id={`${fieldId}-error`}
          data-testid={`${fieldId}-error`}
        >
          {errorMessage}
        </StyledFieldError>
      )}
    </StyledFieldContainer>
  );
};

const areEqual = (prevProps: ObjectFieldProps, nextProps: ObjectFieldProps) => {
  return (
    prevProps.field.value === nextProps.field.value &&
    prevProps.field.errors === nextProps.field.errors &&
    prevProps.field.hasChanges === nextProps.field.hasChanges &&
    prevProps.field.schema === nextProps.field.schema
  );
};

export default memo(ObjectField, areEqual);
