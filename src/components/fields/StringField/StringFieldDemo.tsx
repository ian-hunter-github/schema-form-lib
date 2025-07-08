import React, { useState } from 'react';
import StringField from './StringField';
import type { FormField } from '../../../types';
import type { JSONSchema } from '../../../types/schema';

// Mock FormModel for demo
const createMockFormModel = () => ({
  fields: new Map(),
  listeners: new Set(),
  buildForm: () => {},
  getField: () => undefined,
  getFields: () => new Map(),
  setValue: () => {},
  validate: () => true,
  addValue: () => '',
  deleteValue: () => 0,
  addListener: () => {},
  removeListener: () => {},
  notifyListeners: () => {},
  moveArrayItem: () => {},
  insertArrayItem: () => '',
  getArrayLength: () => 0,
  resetForm: () => {},
  clearErrors: () => {},
  revertField: () => true,
  revertBranch: () => true,
  revertAll: () => {},
  hasUnsavedChanges: () => false,
  getChangedFields: () => [],
  getChangedPaths: () => [],
  createSnapshot: () => new Map(),
  restoreFromSnapshot: () => {},
  setPristineValues: () => {},
  getChangeStatistics: () => ({
    totalFields: 0,
    changedFields: 0,
    dirtyFields: 0,
    hasUnsavedChanges: false,
  }),
});

// Helper function to create mock FormField
const createMockFormField = (overrides: Partial<FormField> = {}): FormField => {
  const defaultSchema: JSONSchema = {
    type: 'string',
    title: 'Demo Field',
    description: 'This is a demo string field',
  };

  return {
    path: 'demoField',
    value: '',
    pristineValue: '',
    schema: defaultSchema,
    errors: [],
    errorCount: 0,
    required: false,
    dirty: false,
    dirtyCount: 0,
    hasChanges: false,
    lastModified: new Date(),
    ...overrides,
  };
};

const StringFieldDemo: React.FC = () => {
  const mockFormModel = createMockFormModel() as unknown;
  const [basicField, setBasicField] = useState(createMockFormField());
  const [requiredField, setRequiredField] = useState(createMockFormField({
    path: 'requiredField',
    required: true,
    schema: {
      type: 'string',
      title: 'Required Field',
      description: 'This field is required',
    },
  }));
  const [errorField, setErrorField] = useState(createMockFormField({
    path: 'errorField',
    value: 'ab',
    errors: ['Field must be at least 3 characters long'],
    errorCount: 1,
    schema: {
      type: 'string',
      title: 'Field with Error',
      description: 'This field has validation errors',
    },
  }));
  const [dirtyField, setDirtyField] = useState(createMockFormField({
    path: 'dirtyField',
    value: 'Modified value',
    pristineValue: 'Original value',
    dirty: true,
    dirtyCount: 1,
    hasChanges: true,
    schema: {
      type: 'string',
      title: 'Dirty Field',
      description: 'This field has been modified',
    },
  }));
  const [readOnlyField] = useState(createMockFormField({
    path: 'readOnlyField',
    value: 'This field is read-only',
    schema: {
      type: 'string',
      title: 'Read-Only Field',
      description: 'This field cannot be edited',
      readOnly: true,
    },
  }));

  const handleFieldChange = (
    fieldSetter: React.Dispatch<React.SetStateAction<FormField>>,
    value: string,
    triggerValidation?: boolean
  ) => {
    fieldSetter(prevField => ({
      ...prevField,
      value,
      dirty: value !== prevField.pristineValue,
      hasChanges: value !== prevField.pristineValue,
      lastModified: new Date(),
      // Simple validation example
      errors: triggerValidation && value.length < 3 ? ['Field must be at least 3 characters long'] : [],
      errorCount: triggerValidation && value.length < 3 ? 1 : 0,
    }));
    console.log('Field changed:', { value, triggerValidation });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>StringField Component Demo</h1>
      <p>This demo showcases the StringField component with various configurations.</p>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Basic Field</h2>
        <StringField
          field={basicField}
          onChange={(value, triggerValidation) => 
            handleFieldChange(setBasicField, value, triggerValidation)
          }
          formModel={mockFormModel}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Required Field</h2>
        <StringField
          field={requiredField}
          onChange={(value, triggerValidation) => 
            handleFieldChange(setRequiredField, value, triggerValidation)
          }
          formModel={mockFormModel}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Field with Validation Error</h2>
        <StringField
          field={errorField}
          onChange={(value, triggerValidation) => 
            handleFieldChange(setErrorField, value, triggerValidation)
          }
          formModel={mockFormModel}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Dirty Field (Modified)</h2>
        <StringField
          field={dirtyField}
          onChange={(value, triggerValidation) => 
            handleFieldChange(setDirtyField, value, triggerValidation)
          }
          formModel={mockFormModel}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Read-Only Field</h2>
        <StringField
          field={readOnlyField}
          onChange={(value, triggerValidation) => 
            console.log('Read-only field change attempted:', { value, triggerValidation })
          }
          formModel={mockFormModel}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Field with Nested Path</h2>
        <StringField
          field={createMockFormField({
            path: 'user.email',
            schema: {
              type: 'string',
              title: 'Email Address',
              description: 'Enter your email address',
            },
          })}
          onChange={(value, triggerValidation) => 
            console.log('Nested path field changed:', { value, triggerValidation })
          }
          formModel={mockFormModel}
        />
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Field States</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify({
            basic: { value: basicField.value, dirty: basicField.dirty, errors: basicField.errors },
            required: { value: requiredField.value, dirty: requiredField.dirty, errors: requiredField.errors },
            error: { value: errorField.value, dirty: errorField.dirty, errors: errorField.errors },
            dirty: { value: dirtyField.value, dirty: dirtyField.dirty, errors: dirtyField.errors },
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default StringFieldDemo;
