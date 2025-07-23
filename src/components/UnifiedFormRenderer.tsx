import React from "react";
import type { JSONSchema, JSONSchemaProperties, JSONValue } from "../types/schema";
import { useFormModel, useUnsavedChangesWarning } from "../hooks/useFormModel";
import FieldRenderer from "./FieldRenderer";

interface UnifiedFormRendererProps {
  schema: JSONSchema | JSONSchemaProperties;
  onSubmit?: (data: Record<string, JSONValue>) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showUnsavedWarning?: boolean;
  showBufferingControls?: boolean;
}

const UnifiedFormRenderer: React.FC<UnifiedFormRendererProps> = ({ 
  schema,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
  showUnsavedWarning = true,
  showBufferingControls = true
}) => {
  const {
    formModel,
    fields,
    setValue,
    validate,
    revertField,
    revertAll,
    hasUnsavedChanges,
    getChangedPaths,
    setPristineValues,
    getChangeStatistics
  } = useFormModel({
    schema,
    validateOnChange,
    validateOnBlur,
    autoValidate: true
  });

  // Enable browser warning for unsaved changes
  useUnsavedChangesWarning(showUnsavedWarning ? hasUnsavedChanges : false);

  const handleFieldChange = (path: string, value: JSONValue, shouldValidate?: boolean) => {
    setValue(path, value, shouldValidate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = validate();
    
    if (isValid && onSubmit) {
      // Extract form data from FormModel
      const formData: Record<string, JSONValue> = {};
      
      for (const [path, field] of fields) {
        // Only include root-level fields (no dots in path) and exclude empty path
        if (!path.includes('.') && path !== '' && field.value !== undefined && field.value !== null && field.value !== '') {
          formData[path] = field.value;
        }
      }
      
      onSubmit(formData);
      
      // Mark as saved after successful submit
      setPristineValues();
    }
  };

  // Get root-level fields (fields without dots in their path and exclude empty path)
  const rootFields = Array.from(fields.entries())
    .filter(([path]) => !path.includes('.') && path !== '')
    .map(([, field]) => field);

  const stats = getChangeStatistics();
  const changedPaths = getChangedPaths();

  return (
    <div className="unified-form-container">
      {/* Status Bar */}
      {showBufferingControls && (
        <div style={{ 
          background: hasUnsavedChanges ? '#fff3cd' : '#d4edda', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px',
          border: `1px solid ${hasUnsavedChanges ? '#ffeaa7' : '#c3e6cb'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>Status:</strong> {hasUnsavedChanges ? 'Unsaved Changes' : 'All Changes Saved'}
            {hasUnsavedChanges && (
              <span style={{ marginLeft: '10px', fontSize: '0.9em' }}>
                ({stats.changedFields} field{stats.changedFields !== 1 ? 's' : ''} modified)
              </span>
            )}
          </div>
          
          {hasUnsavedChanges && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={revertAll}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.8em',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Revert All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <form data-testid="unified-form-renderer" onSubmit={handleSubmit}>
        {rootFields.map((field) => (
          <div key={field.path} style={{ marginBottom: '15px' }}>
            <FieldRenderer
              field={field}
              formModel={formModel}
              onChange={(value, shouldValidate) => handleFieldChange(field.path, value, shouldValidate)}
              nestingDepth={0}
            />
            
            {/* Individual field revert button */}
            {showBufferingControls && field.hasChanges && (
              <button
                type="button"
                onClick={() => revertField(field.path)}
                style={{
                  marginTop: '5px',
                  padding: '2px 6px',
                  fontSize: '0.7em',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
              >
                Revert {field.path}
              </button>
            )}
          </div>
        ))}
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            type="submit" 
            data-testid="submit-button"
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Submit
          </button>
          
          {showBufferingControls && (
            <>
              <button
                type="button"
                onClick={() => validate()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Validate
              </button>
              
              {hasUnsavedChanges && (
                <button
                  type="button"
                  onClick={setPristineValues}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Mark as Saved
                </button>
              )}
            </>
          )}
        </div>
      </form>

      {/* Debug Info */}
      {showBufferingControls && changedPaths.length > 0 && (
        <div style={{ 
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          fontSize: '0.9em'
        }}>
          <strong>Changed Fields:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {changedPaths.map(path => (
              <li key={path}>
                {path}
                <button
                  type="button"
                  onClick={() => revertField(path)}
                  style={{
                    marginLeft: '8px',
                    padding: '1px 4px',
                    fontSize: '0.7em',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  Revert
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UnifiedFormRenderer;
