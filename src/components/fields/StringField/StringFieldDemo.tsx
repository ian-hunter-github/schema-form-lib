import React, { useState } from 'react';
import StringField from './StringField';
import type { FormField } from '../../../types';
import type { JSONSchema, JSONValue } from '../../../types/schema';
import { FormModel } from '../../../utils/form/FormModel';

class MockFormModel extends FormModel {
  constructor() {
    super({ type: 'object' }); // Pass minimal schema to parent constructor
  }

  // Override methods with mock implementations
  getField(path: string): FormField {
    return {
      path,
      value: '',
      pristineValue: '',
      schema: { type: 'string' },
      errors: [],
      errorCount: 0,
      required: false,
      dirty: false,
      dirtyCount: 0,
      hasChanges: false,
      lastModified: new Date()
    };
  }

  getFields(): Map<string, FormField> {
    return new Map();
  }

  setValue(): void {}
  
  validate(): boolean {
    return true;
  }

  // Add other required mock implementations
  addValue(): string { return ''; }
  deleteValue(): number { return 0; }
  addListener(): void {}
  removeListener(): void {}
  moveArrayItem(): void {}
  insertArrayItem(): string { return ''; }
  getArrayLength(): number { return 0; }
  resetForm(): void {}
  clearErrors(): void {}
  revertField(): boolean { return true; }
  revertBranch(): boolean { return true; }
  revertAll(): void {}
  hasUnsavedChanges(): boolean { return false; }
  getChangedFields(): FormField[] { return []; }
  getChangedPaths(): string[] { return []; }
  createSnapshot(): Map<string, string | number | boolean | null> { return new Map(); }
  restoreFromSnapshot(): void {}
  setPristineValues(): void {}
  getChangeStatistics() {
    return {
      totalFields: 0,
      changedFields: 0,
      dirtyFields: 0,
      hasUnsavedChanges: false
    };
  }
}

// Create mock FormModel instance
const createMockFormModel = () => new MockFormModel();

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
  const mockFormModel = createMockFormModel();
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
    value: JSONValue,
    triggerValidation?: boolean
  ) => {
    const stringValue = typeof value === 'string' ? value : '';
    fieldSetter(prevField => ({
      ...prevField,
      value: stringValue,
      dirty: stringValue !== prevField.pristineValue,
      hasChanges: stringValue !== prevField.pristineValue,
      lastModified: new Date(),
      // Simple validation example
      errors: triggerValidation && stringValue.length < 3 ? ['Field must be at least 3 characters long'] : [],
      errorCount: triggerValidation && stringValue.length < 3 ? 1 : 0,
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
            handleFieldChange(setBasicField, value as string, triggerValidation)
          }
          formModel={mockFormModel}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Required Field</h2>
        <StringField
          field={requiredField}
          onChange={(value, triggerValidation) => 
            handleFieldChange(setRequiredField, value as string, triggerValidation)
          }
          formModel={mockFormModel}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Field with Validation Error</h2>
        <StringField
          field={errorField}
          onChange={(value, triggerValidation) => 
            handleFieldChange(setErrorField, value as string, triggerValidation)
          }
          formModel={mockFormModel}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Dirty Field (Modified)</h2>
        <StringField
          field={dirtyField}
          onChange={(value, triggerValidation) => 
            handleFieldChange(setDirtyField, value as string, triggerValidation)
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
