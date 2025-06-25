import type { JSONSchemaProperties, JSONSchema, JSONValue, FormValue, JSONObject } from '../types/schema';
import { FormModelCore } from './formModel/FormModelCore';
import { isJSONSchema, isJSONObject } from './formModel/schemaUtils';
import type { FormField } from './formModel/types';

export class FormModel extends FormModelCore {
  constructor(schema: JSONSchema | JSONSchemaProperties) {
    const effectiveSchema = isJSONSchema(schema) ? schema : { type: 'object' as const, properties: schema };
    super(effectiveSchema);
    this.buildFields('', schema);
  }

  private buildFields(basePath: string, schema: JSONSchemaProperties | JSONSchema) {
    if (isJSONSchema(schema)) {
      this.processSchema(basePath, schema);
    } else {
      for (const [key, fieldSchema] of Object.entries(schema)) {
        const path = basePath ? `${basePath}.${key}` : key;
        this.processSchema(path, fieldSchema);
      }
    }
  }

  private processSchema(path: string, schema: JSONSchema) {
    if (schema.type === 'object' && schema.properties) {
      const value: Record<string, JSONValue> = {};
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (isJSONSchema(propSchema)) {
          if (propSchema.default !== undefined) {
            value[key] = this.convertFormValue(propSchema.default);
          } else if (propSchema.type === 'object') {
            value[key] = {};
          } else if (propSchema.type === 'array') {
            value[key] = [];
          } else if (propSchema.type === 'string') {
            value[key] = '';
          }
        }
      }
      this.buildFields(path, schema.properties);
      
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

      if (schema.items) {
        const itemSchema = schema.items as JSONSchema;
        for (let i = 0; i < defaultValue.length; i++) {
          const itemPath = `${path}.${i}`;
          const itemValue = defaultValue[i];
          this.fields.set(itemPath, {
            path: itemPath,
            value: itemValue,
            schema: itemSchema,
            errors: [],
            errorCount: 0,
            required: itemSchema.required || false,
            dirty: false,
            dirtyCount: 0
          });

          if (itemSchema.type === 'object' && itemSchema.properties && typeof itemValue === 'object' && itemValue !== null && !Array.isArray(itemValue)) {
            for (const [key, propSchema] of Object.entries(itemSchema.properties)) {
              const propPath = `${itemPath}.${key}`;
              let propValue = undefined;
              if (isJSONObject(itemValue) && key in itemValue) {
                propValue = (itemValue as JSONObject)[key];
              } else if (propSchema.default !== undefined) {
                propValue = this.convertFormValue(propSchema.default);
              } else if (propSchema.type === 'string') {
                propValue = propSchema.default !== undefined ? propSchema.default : undefined;
              } else if (propSchema.type === 'object' && propSchema.properties) {
                propValue = {};
                for (const [nestedKey, nestedSchema] of Object.entries(propSchema.properties)) {
                  if (nestedSchema.default !== undefined) {
                    (propValue as JSONObject)[nestedKey] = nestedSchema.default;
                  }
                }
              } else if (propSchema.type === 'array') {
                propValue = propSchema.default !== undefined ? propSchema.default : undefined;
              }
              this.fields.set(propPath, {
                path: propPath,
                value: propValue,
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

  public getField(path: string): FormField | undefined {
    console.log('[FormModel.getField] Starting for path:', path);
    let field = super.getField(path);
    if (field) {
      console.log('[FormModel.getField] Found via parent:', field);
      return field;
    }
    
    field = this.fields.get(path);
    console.log('[getField] Initial field lookup:', field ? 'found' : 'not found');
    
    if (!field && path.includes('.')) {
      const parts = path.split('.');
      const lastPart = parts[parts.length - 1];
      
      if (!isNaN(Number(lastPart))) {
        const parentPath = parts.slice(0, -1).join('.');
        const parent = this.fields.get(parentPath);
        if (parent && parent.schema.type === 'array' && parent.schema.items) {
          const index = Number(lastPart);
          
          if (!Array.isArray(parent.value)) {
            parent.value = [];
          }
          
          // Only create field if the index exists in the array
          if (index >= 0 && index < parent.value.length) {
            const fieldValue = parent.value[index];
            const itemsSchema = parent.schema.items as JSONSchema;
            
            // Initialize field even if value is undefined for required validation
            if (itemsSchema) {
              // If the value was provided (not undefined/null), ensure it has all required properties
              if (itemsSchema.type === 'object' && itemsSchema.properties && 
                  typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
                const fieldObj = fieldValue as JSONObject;
                for (const [key, propSchema] of Object.entries(itemsSchema.properties)) {
                  if (!(key in fieldObj)) {
                    if (propSchema.default !== undefined) {
                      fieldObj[key] = this.convertFormValue(propSchema.default);
                    } else if (propSchema.type === 'string') {
                      fieldObj[key] = '';
                    } else if (propSchema.type === 'object') {
                      fieldObj[key] = {};
                    } else if (propSchema.type === 'array') {
                      fieldObj[key] = [];
                    }
                  }
                }
              }

              field = {
                path,
                value: fieldValue,
                schema: parent.schema.items as JSONSchema,
                errors: [],
                errorCount: 0,
                required: (parent.schema.items as JSONSchema).required || false,
                dirty: false,
                dirtyCount: 0
              };
              this.fields.set(path, field);
            }

            // Initialize nested properties for array items
            const nestedSchema = parent.schema.items as JSONSchema;
            if (fieldValue !== undefined && fieldValue !== null && 
                nestedSchema.type === 'object' && nestedSchema.properties) {
              for (const [key, propSchema] of Object.entries(nestedSchema.properties)) {
                const nestedPath = `${path}.${key}`;
                if (!this.fields.has(nestedPath)) {
                  let nestedValue: JSONValue = undefined;
                  if (fieldValue && isJSONObject(fieldValue) && key in fieldValue) {
                    nestedValue = fieldValue[key];
                  } else if (isJSONSchema(propSchema)) {
                    if (propSchema.default !== undefined) {
                      nestedValue = this.convertFormValue(propSchema.default);
                    } else if (propSchema.type === 'string') {
                      nestedValue = '';
                      if (fieldValue && isJSONObject(fieldValue)) {
                        fieldValue[key] = nestedValue;
                      }
                    } else if (propSchema.type === 'object') {
                      nestedValue = {};
                      if (fieldValue && isJSONObject(fieldValue)) {
                        fieldValue[key] = nestedValue;
                      }
                    } else if (propSchema.type === 'array') {
                      nestedValue = [];
                      if (fieldValue && isJSONObject(fieldValue)) {
                        fieldValue[key] = nestedValue;
                      }
                    }
                  }

                  // Always create nested fields for validation
                  if (nestedValue === undefined) {
                    if (propSchema.type === 'string') {
                      nestedValue = '';
                    } else if (propSchema.type === 'object') {
                      nestedValue = {};
                    } else if (propSchema.type === 'array') {
                      nestedValue = [];
                    }
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
            return field;
          }
        }
      } else {
        const parentPath = parts.slice(0, -1).join('.');
        const parent = this.fields.get(parentPath);
        if (parent && parent.schema.type === 'object' && parent.schema.properties) {
          const propName = lastPart;
          if (propName in parent.schema.properties) {
            let propValue = undefined;
            if (isJSONObject(parent.value) && propName in parent.value) {
              propValue = (parent.value as JSONObject)[propName];
            } else if (parent.schema.properties[propName].default !== undefined) {
              propValue = this.convertFormValue(parent.schema.properties[propName].default);
            } else if (parent.schema.properties[propName].type === 'string') {
              propValue = '';
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

  public addValue(arrayPath: string, value: JSONValue): string {
    return super.addValue(arrayPath, value);
  }

  public deleteValue(elementPath: string): number {
    return super.deleteValue(elementPath);
  }
}
