import type { JSONSchemaProperties, JSONSchema, JSONValue, FormValue, JSONObject } from '../types/schema';

interface FormField {
  path: string;
  value: JSONValue;
  schema: JSONSchema;
  errors: string[];
  errorCount: number;
  required: boolean;
  dirty: boolean;
  dirtyCount: number;
}

function isJSONSchema(schema: unknown): schema is JSONSchema {
  return typeof schema === 'object' && schema !== null && 'type' in schema;
}

export class FormModel {
  private fields: Map<string, FormField> = new Map();

  constructor(schema: JSONSchemaProperties) {
    this.buildFields('', schema);
  }

  private buildFields(basePath: string, schema: JSONSchemaProperties | JSONSchema) {
    if (isJSONSchema(schema)) {
      // Handle single schema definition
      this.processSchema(basePath, schema);
    } else {
      // Handle properties object
      for (const [key, fieldSchema] of Object.entries(schema)) {
        const path = basePath ? `${basePath}.${key}` : key;
        this.processSchema(path, fieldSchema);
      }
    }
  }

  private processSchema(path: string, schema: JSONSchema) {
    if (schema.type === 'object' && schema.properties) {
      this.buildFields(path, schema.properties);
      const value: Record<string, JSONValue> = {};
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (isJSONSchema(propSchema)) {
            if (propSchema.default !== undefined) {
              value[key] = this.convertFormValue(propSchema.default);
            } else if (propSchema.type === 'string') {
              value[key] = '';
            }
          }
        }
      }
      
      this.fields.set(path, {
        path,
        value,
        schema,
        errors: [],
        errorCount: 0,
        required: schema.required || false,
        dirty: false,
        dirtyCount: 0
      });
    } else if (schema.type === 'array' && schema.items) {
      const defaultValue = Array.isArray(schema.default) ? schema.default : [];
      this.fields.set(path, {
        path,
        value: defaultValue,
        schema,
        errors: [],
        errorCount: 0,
        required: schema.required || false,
        dirty: false,
        dirtyCount: 0
      });

      // Only create fields for existing array items
      if (schema.items && defaultValue.length > 0) {
        const itemSchema = schema.items as JSONSchema;
        for (let i = 0; i < defaultValue.length; i++) {
          const itemPath = `${path}.${i}`;
          this.fields.set(itemPath, {
            path: itemPath,
            value: defaultValue[i],
            schema: itemSchema,
            errors: [],
            errorCount: 0,
            required: itemSchema.required || false,
            dirty: false,
            dirtyCount: 0
          });
        }
      }
    } else {
      let defaultValue;
      if (schema.default !== undefined) {
        defaultValue = this.convertFormValue(schema.default);
      } else if (schema.type === 'string') {
        defaultValue = '';
      } else {
        defaultValue = undefined;
      }
      
      this.fields.set(path, {
        path,
        value: defaultValue,
        schema,
        errors: [],
        errorCount: 0,
        required: schema.required || false,
        dirty: false,
        dirtyCount: 0
      });
    }
  }

  getField(path: string): FormField | undefined {
    let field = this.fields.get(path);
    if (!field && path.includes('.')) {
      const parts = path.split('.');
      const lastPart = parts[parts.length - 1];
      
      // Handle array indices (e.g. 'tags.0')
      if (!isNaN(Number(lastPart))) {
        const parentPath = parts.slice(0, -1).join('.');
        const parent = this.fields.get(parentPath);
        if (parent && parent.schema.type === 'array' && parent.schema.items) {
          const index = Number(lastPart);
          // Only create field if parent array has this index and value exists
          if (Array.isArray(parent.value) && index < parent.value.length && parent.value[index] !== undefined) {
            field = {
              path,
              value: parent.value[index],
              schema: parent.schema.items as JSONSchema,
              errors: [],
              errorCount: 0,
              required: (parent.schema.items as JSONSchema).required || false,
              dirty: false,
              dirtyCount: 0
            };
            this.fields.set(path, field);
            
            // If this is an array of objects, ensure nested fields exist
            if (field.schema.type === 'object' && field.schema.properties) {
              for (const [key, propSchema] of Object.entries(field.schema.properties)) {
                const nestedPath = `${path}.${key}`;
                if (!this.fields.has(nestedPath)) {
                  let nestedValue = undefined;
                  if (typeof field.value === 'object' && field.value !== null && !Array.isArray(field.value)) {
                    nestedValue = field.value[key];
                  } else if ((propSchema as JSONSchema).type === 'string') {
                    nestedValue = '';
                  }
                  this.fields.set(nestedPath, {
                    path: nestedPath,
                    value: nestedValue,
                    schema: propSchema as JSONSchema,
                    errors: [],
                    errorCount: 0,
                    required: (propSchema as JSONSchema).required || false,
                    dirty: false,
                    dirtyCount: 0
                  });
                }
              }
            }
          }
        }
      }
      // Handle nested object properties (e.g. 'people.0.name')
      else {
        const parentPath = parts.slice(0, -1).join('.');
        const parent = this.fields.get(parentPath);
        if (parent && parent.schema.type === 'object' && parent.schema.properties) {
          const propName = lastPart;
          if (propName in parent.schema.properties) {
            let propValue = undefined;
            if (typeof parent.value === 'object' && parent.value !== null && !Array.isArray(parent.value)) {
              propValue = parent.value[propName];
            }
            field = {
              path,
              value: propValue,
              schema: parent.schema.properties[propName] as JSONSchema,
              errors: [],
              errorCount: 0,
              required: (parent.schema.properties[propName] as JSONSchema).required || false,
              dirty: false,
              dirtyCount: 0
            };
            this.fields.set(path, field);
          }
        }
      }
    }

    return field || undefined;
  }

  setValue(path: string, value: JSONValue): void {
    // Handle array items by ensuring the field exists
    if (path.includes('.') && !isNaN(Number(path.split('.').pop()))) {
      const parentPath = path.split('.').slice(0, -1).join('.');
      const parent = this.fields.get(parentPath);
      if (parent && Array.isArray(parent.value)) {
        const index = Number(path.split('.').pop());
        // Ensure parent array has enough elements
        while (parent.value.length <= index) {
          parent.value.push(undefined);
        }
        parent.value[index] = value;
        
        if (!this.fields.has(path)) {
          const field = {
            path,
            value,
            schema: parent.schema.items as JSONSchema,
            errors: [],
            errorCount: 0,
            required: (parent.schema.items as JSONSchema).required || false,
            dirty: false,
            dirtyCount: 0
          };
          this.fields.set(path, field);
          
          // If this is an array of objects, ensure nested fields exist
          if (field.schema.type === 'object' && field.schema.properties) {
            for (const [key, propSchema] of Object.entries(field.schema.properties)) {
              const nestedPath = `${path}.${key}`;
              if (!this.fields.has(nestedPath)) {
                let nestedValue = undefined;
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                  nestedValue = value[key];
                } else if ((propSchema as JSONSchema).type === 'string') {
                  nestedValue = '';
                }
                this.fields.set(nestedPath, {
                  path: nestedPath,
                  value: nestedValue,
                  schema: propSchema as JSONSchema,
                  errors: [],
                  errorCount: 0,
                  required: (propSchema as JSONSchema).required || false,
                  dirty: false,
                  dirtyCount: 0
                });
              }
            }
          }
        }
      }
    }

    let field = this.fields.get(path);
    if (!field && path.includes('.') && !isNaN(Number(path.split('.').pop()))) {
      // Try to create missing array item field
      const parentPath = path.split('.').slice(0, -1).join('.');
      const parent = this.fields.get(parentPath);
      if (parent && Array.isArray(parent.value)) {
        const index = Number(path.split('.').pop());
        if (index < parent.value.length) {
          field = {
            path,
            value: parent.value[index],
            schema: parent.schema.items as JSONSchema,
            errors: [],
            errorCount: 0,
            required: false,
            dirty: false,
            dirtyCount: 0
          };
          this.fields.set(path, field);
        }
      }
    }

    if (!field) {
      // Try to create missing field for nested array objects
      if (path.includes('.')) {
        const parts = path.split('.');
        const lastPart = parts[parts.length - 1];
        
        // Handle nested array objects (e.g. 'people.0.age')
        if (!isNaN(Number(parts[parts.length - 2]))) {
          const arrayPath = parts.slice(0, -2).join('.');
          const arrayField = this.fields.get(arrayPath);
          if (arrayField && arrayField.schema.type === 'array' && 
              arrayField.schema.items && 
              (arrayField.schema.items as JSONSchema).type === 'object' &&
              (arrayField.schema.items as JSONSchema).properties) {
            
            const itemsSchema = arrayField.schema.items as JSONSchema;
            if (itemsSchema.type === 'object' && itemsSchema.properties) {
              const itemSchema = itemsSchema.properties[lastPart];
              if (itemSchema) {
                field = {
                  path,
                  value,
                  schema: itemSchema,
                  errors: [],
                  errorCount: 0,
                  required: (itemSchema as JSONSchema).required || false,
                  dirty: false,
                  dirtyCount: 0
                };
                this.fields.set(path, field);
              }
            }
          }
        }
      }
      
      if (!field) {
        throw new Error(`Field not found: ${path}`);
      }
    }
    field.value = value;
    field.dirty = true;
    this.updateParentValues(path, value);
  }

  private updateParentValues(path: string, value: JSONValue) {
    const parts = path.split('.');
    if (parts.length > 1) {
      const parentPath = parts.slice(0, -1).join('.');
      const parent = this.fields.get(parentPath);
      if (parent) {
        const key = parts[parts.length - 1];
        if (Array.isArray(parent.value)) {
          const index = parseInt(key, 10);
          parent.value[index] = value;
          // Ensure array item field exists
          if (!this.fields.has(path)) {
            this.fields.set(path, {
              path,
              value,
              schema: parent.schema.items as JSONSchema,
              errors: [],
              errorCount: 0,
              required: false,
              dirty: false,
              dirtyCount: 0
            });
          }
        } else if (typeof parent.value === 'object' && parent.value !== null) {
          parent.value[key] = value;
        }
        parent.dirty = true;
        parent.dirtyCount = Array.from(this.fields.values())
          .filter(f => f.path.startsWith(parentPath + '.'))
          .reduce((sum, f) => sum + (f.dirty ? 1 : 0), 0);
        this.updateParentValues(parentPath, parent.value);
      }
    }
  }

  validate(): boolean {
    let isValid = true;
    
    // First pass - validate all fields and count errors
    for (const field of this.fields.values()) {
      field.errors = [];
      field.errorCount = 0;
      
      // Validate required fields
      if (field.required && 
          (field.value === undefined || 
           field.value === null || 
           field.value === '' ||
           (typeof field.value === 'object' && field.value !== null && Object.keys(field.value).length === 0) ||
           (Array.isArray(field.value) && field.value.length === 0))) {
        field.errors.push('Field is required');
        field.errorCount++;
        isValid = false;
      }

      // Validate type constraints
      if (field.value !== undefined && field.value !== null && field.schema.type) {
        if (field.schema.type === 'number') {
          if (typeof field.value !== 'number') {
            field.errors.push('Must be a number');
            field.errorCount++;
            isValid = false;
          } else {
            if (field.schema.minimum !== undefined && field.value < field.schema.minimum) {
              field.errors.push(`Must be at least ${field.schema.minimum}`);
              field.errorCount++;
              isValid = false;
            }
            if (field.schema.maximum !== undefined && field.value > field.schema.maximum) {
              field.errors.push(`Must be at most ${field.schema.maximum}`);
              field.errorCount++;
              isValid = false;
            }
          }
        } else if (field.schema.type === 'string') {
          if (typeof field.value !== 'string') {
            field.errors.push('Must be a string');
            field.errorCount++;
            isValid = false;
          } else {
            if (field.schema.minLength !== undefined && field.value.length < field.schema.minLength) {
              field.errors.push(`Must be at least ${field.schema.minLength} characters`);
              field.errorCount++;
              isValid = false;
            }
            if (field.schema.maxLength !== undefined && field.value.length > field.schema.maxLength) {
              field.errors.push(`Must be at most ${field.schema.maxLength} characters`);
              field.errorCount++;
              isValid = false;
            }
          }
        } else if (field.schema.type === 'boolean' && typeof field.value !== 'boolean') {
          field.errors.push('Must be a boolean');
          field.errorCount++;
          isValid = false;
        }

        // Validate enum values
        if (field.schema.enum) {
          const enumValues = field.schema.enum.map(String);
          if (!enumValues.includes(String(field.value))) {
            field.errors.push(`Must be one of: ${field.schema.enum.join(', ')}`);
            field.errorCount++;
            isValid = false;
          }
        }
      }

      // Validate array items
      if (field.schema.type === 'array' && Array.isArray(field.value)) {
        for (let i = 0; i < field.value.length; i++) {
          const itemPath = `${field.path}.${i}`;
          let itemField = this.fields.get(itemPath);
          
          // Ensure array item field exists
          if (!itemField) {
            itemField = {
              path: itemPath,
              value: field.value[i],
              schema: field.schema.items as JSONSchema,
              errors: [],
              errorCount: 0,
              required: (field.schema.items as JSONSchema).required || false,
              dirty: false,
              dirtyCount: 0
            };
            this.fields.set(itemPath, itemField);
          }

          // Validate array item
          if (itemField.required && 
              (itemField.value === undefined || 
               itemField.value === null || 
               itemField.value === '')) {
            itemField.errors.push('Field is required');
            itemField.errorCount++;
            isValid = false;
          }

          // For arrays of objects, ensure nested fields exist
          if (typeof itemField.value === 'object' && itemField.value !== null && 
              !Array.isArray(itemField.value) && 
              itemField.schema.type === 'object' && 
              itemField.schema.properties) {
            for (const [key, propSchema] of Object.entries(itemField.schema.properties)) {
              const nestedPath = `${itemPath}.${key}`;
              if (!this.fields.has(nestedPath)) {
                this.fields.set(nestedPath, {
                  path: nestedPath,
                  value: itemField.value[key],
                  schema: propSchema as JSONSchema,
                  errors: [],
                  errorCount: 0,
                  required: (propSchema as JSONSchema).required || false,
                  dirty: false,
                  dirtyCount: 0
                });
              }
            }
          }

          // Propagate errors to parent
          if (itemField.errorCount > 0) {
            field.errorCount += itemField.errorCount;
            isValid = false;
          }
        }
      }
    }

    // Second pass - update error counts for parent objects/arrays
    for (const field of this.fields.values()) {
      if (field.path.includes('.')) {
        const parentPath = field.path.split('.').slice(0, -1).join('.');
        const parent = this.fields.get(parentPath);
        if (parent) {
          parent.errorCount = Array.from(this.fields.values())
            .filter(f => f.path.startsWith(parentPath + '.'))
            .reduce((sum, f) => sum + f.errorCount, 0);
        }
      }
    }

    return isValid;
  }

  private convertFormValue(value: FormValue): JSONValue {
    if (Array.isArray(value)) {
      return value.map(item => this.convertFormValue(item));
    }
    if (typeof value === 'object' && value !== null) {
      const result: JSONObject = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.convertFormValue(val);
      }
      return result;
    }
    return value;
  }

  toJSON(clean = false): Record<string, JSONValue> {
    const result: Record<string, JSONValue> = {};
    
    for (const field of this.fields.values()) {
      if (field.path.includes('.')) continue; // Skip nested fields
      
      if (!clean || (field.value !== undefined && field.value !== null && field.value !== '' && 
        !(typeof field.value === 'object' && field.value !== null && Object.keys(field.value).length === 0) &&
        !(Array.isArray(field.value) && field.value.length === 0))) {
        result[field.path] = field.value === '' ? undefined : field.value;
      }
    }

    return result;
  }
}
