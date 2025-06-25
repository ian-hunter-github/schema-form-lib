import React, { useState } from 'react';
import type { FormField } from '../../../utils/formModel/types';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import StringField from '../StringField';
import NumberField from '../NumberField';
import BooleanField from '../BooleanField';
import EnumField from '../EnumField';
import ArrayOfPrimitiveField from '../ArrayOfPrimitiveField';

export interface ObjectFieldProps {
  field: FormField;
  onChange: (value: Record<string, any>, triggerValidation?: boolean) => void;
  domContextId?: string;
  formModel?: any; // We'll need access to the FormModel to get nested fields
}

const ObjectField: React.FC<ObjectFieldProps> = ({ 
  field, 
  onChange, 
  domContextId,
  formModel 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const fieldId = domContextId ? `${domContextId}.${field.path}` : field.path;
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
  const handleNestedChange = (propertyKey: string, value: any, triggerValidation?: boolean) => {
    if (!formModel) return;
    const nestedPath = field.path ? `${field.path}.${propertyKey}` : propertyKey;
    formModel.setValue(nestedPath, value);
  };

  // Helper function to render a nested field
  const renderNestedField = (propertyKey: string, propertySchema: any) => {
    const nestedField = getNestedField(propertyKey);
    if (!nestedField) return null;

    const nestedFieldId = `${fieldId}.${propertyKey}`;
    
    // Determine the field component to use
    let FieldComponent;
    
    if (propertySchema.enum) {
      FieldComponent = EnumField;
    } else if (propertySchema.type === 'object' && propertySchema.properties) {
      // Recursive case - render another ObjectField
      return (
        <ObjectField
          key={propertyKey}
          field={nestedField}
          onChange={(value, triggerValidation) => handleNestedChange(propertyKey, value, triggerValidation)}
          domContextId={nestedFieldId}
          formModel={formModel}
        />
      );
    } else if (propertySchema.type === 'array') {
      FieldComponent = ArrayOfPrimitiveField;
    } else {
      const fieldType = propertySchema.type === 'integer' ? 'number' : propertySchema.type;
      switch (fieldType) {
        case 'string':
          FieldComponent = StringField;
          break;
        case 'number':
          FieldComponent = NumberField;
          break;
        case 'boolean':
          FieldComponent = BooleanField;
          break;
        default:
          FieldComponent = null;
      }
    }

    if (!FieldComponent) {
      return (
        <div key={propertyKey} style={{ color: 'red' }}>
          Unsupported field type: {propertySchema.type}
        </div>
      );
    }

    return (
      <div key={propertyKey} style={{ marginBottom: '10px' }}>
        <FieldComponent
          field={nestedField}
          onChange={(value: any, triggerValidation?: boolean) => 
            handleNestedChange(propertyKey, value, triggerValidation)
          }
          domContextId={nestedFieldId}
        />
      </div>
    );
  };

  return (
    <div className="field-container object-field">
      {/* Accordion Header */}
      <div 
        className="object-field-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: field.hasChanges ? '#fff3cd' : '#f8f9fa',
          border: `1px solid ${field.hasChanges ? '#ffc107' : '#dee2e6'}`,
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: isExpanded ? '10px' : '0'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span 
          style={{ 
            marginRight: '8px',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          ▶
        </span>
        <label 
          htmlFor={fieldId}
          id={`${fieldId}-label`}
          data-testid={`${fieldId}-label`}
          className={field.required ? 'label required' : 'label'}
          style={{ 
            fontWeight: 'bold',
            margin: 0,
            cursor: 'pointer',
            flex: 1
          }}
        >
          {capitalizeFirstLetter(field.schema.title || displayName)}
        </label>
        
        {field.dirty && (
          <div 
            id={`${fieldId}-dirty-indicator`}
            data-testid={`${fieldId}-dirty-indicator`}
            style={{ 
              fontSize: '0.8em', 
              color: '#666',
              marginLeft: '10px'
            }}
          >
            Modified
          </div>
        )}
      </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div 
          className="object-field-content"
          style={{
            paddingLeft: '20px',
            borderLeft: '2px solid #dee2e6',
            marginLeft: '10px'
          }}
        >
          {field.schema.description && (
            <div 
              id={`${fieldId}-description`}
              data-testid={`${fieldId}-description`}
              style={{ 
                marginBottom: '10px',
                color: '#666',
                fontSize: '0.9em'
              }}
            >
              {field.schema.description}
            </div>
          )}

          {/* Render nested fields */}
          {propertyKeys.map(propertyKey => 
            renderNestedField(propertyKey, properties[propertyKey])
          )}

          {propertyKeys.length === 0 && (
            <div style={{ color: '#666', fontStyle: 'italic' }}>
              No properties defined for this object
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {hasErrors && (
        <div 
          id={`${fieldId}-error`}
          data-testid={`${fieldId}-error`}
          style={{ 
            color: 'red',
            marginTop: '5px',
            fontSize: '0.9em'
          }}
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default ObjectField;
