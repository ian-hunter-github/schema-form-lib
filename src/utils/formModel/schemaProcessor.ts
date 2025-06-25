import type { JSONSchemaProperties, JSONSchema, JSONValue } from '../../types/schema';
import type { FormField } from './types';
import { isJSONSchema, isJSONObject } from './types';

export function buildFields(
  fields: Map<string, FormField>,
  basePath: string, 
  schema: JSONSchemaProperties | JSONSchema
) {
  if (isJSONSchema(schema)) {
    processSchema(fields, basePath, schema);
  } else {
    for (const [key, fieldSchema] of Object.entries(schema)) {
      const path = basePath ? `${basePath}.${key}` : key;
      processSchema(fields, path, fieldSchema);
    }
  }
}

export function processSchema(
  fields: Map<string, FormField>,
  path: string, 
  schema: JSONSchema
) {
  if (schema.type === 'object' && schema.properties) {
    const value: Record<string, JSONValue> = {};
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (isJSONSchema(propSchema)) {
        if (propSchema.default !== undefined) {
          value[key] = convertFormValue(propSchema.default);
        } else if (propSchema.type === 'object') {
          value[key] = {};
        } else if (propSchema.type === 'array') {
          value[key] = [];
        } else if (propSchema.type === 'string') {
          value[key] = '';
        }
      }
    }

    fields.set(path, {
      path,
      value,
      schema,
      errors: [],
      errorCount: 0,
      required: schema.required || false,
      dirty: false,
      dirtyCount: 0
    });

    buildFields(fields, path, schema.properties);
    
  } else if (schema.type === 'array' && schema.items) {
    const defaultValue = Array.isArray(schema.default) ? schema.default : [];
    fields.set(path, {
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
      // Initialize with at least one item if required
      if (defaultValue.length === 0 && schema.required) {
        let initialValue: JSONValue;
        if (itemSchema.type === 'object' && itemSchema.properties) {
          initialValue = {};
          for (const [key, propSchema] of Object.entries(itemSchema.properties)) {
            if (isJSONSchema(propSchema) && propSchema.default !== undefined) {
              (initialValue as Record<string, JSONValue>)[key] = convertFormValue(propSchema.default);
            }
          }
        } else {
          initialValue = itemSchema.type === 'object' ? {} : 
                       itemSchema.type === 'array' ? [] : 
                       itemSchema.type === 'string' ? '' : undefined;
        }
        defaultValue.push(initialValue);
      }
      
      for (let i = 0; i < defaultValue.length; i++) {
        const itemPath = `${path}.${i}`;
        let itemValue: JSONValue = defaultValue[i];
        
        if (itemValue === undefined || itemValue === null) {
          if (itemSchema.type === 'object') {
            itemValue = {};
            if (itemSchema.properties) {
              const obj: Record<string, JSONValue> = {};
              for (const [key, propSchema] of Object.entries(itemSchema.properties)) {
                if (isJSONSchema(propSchema)) {
                  if (propSchema.default !== undefined) {
                    obj[key] = convertFormValue(propSchema.default);
                  } else if (propSchema.required) {
                    obj[key] = propSchema.type === 'string' ? '' : 
                              propSchema.type === 'array' ? [] : 
                              propSchema.type === 'object' ? {} : undefined;
                  }
                }
              }
              itemValue = obj;
            }
          } else if (itemSchema.type === 'array') {
            itemValue = [];
          } else if (itemSchema.type === 'string') {
            itemValue = '';
          }
          defaultValue[i] = itemValue;
        } else if (typeof itemValue === 'object' && itemValue !== null && itemSchema.type === 'object' && itemSchema.properties) {
          // Ensure all required properties exist in existing objects
          for (const [key, propSchema] of Object.entries(itemSchema.properties)) {
            if (isJSONSchema(propSchema) && propSchema.required && !(key in itemValue)) {
              (itemValue as Record<string, JSONValue>)[key] = 
                propSchema.type === 'string' ? '' : 
                propSchema.type === 'array' ? [] : 
                propSchema.type === 'object' ? {} : undefined;
            }
          }
        }

        // Ensure nested objects in arrays get their fields built
        if (itemSchema.type === 'object' && itemSchema.properties) {
          buildFields(fields, itemPath, itemSchema.properties);
        }

        fields.set(itemPath, {
          path: itemPath,
          value: itemValue,
          schema: itemSchema,
          errors: [],
          errorCount: 0,
          required: itemSchema.required || false,
          dirty: false,
          dirtyCount: 0
        });

        if (itemSchema.type === 'object' && itemSchema.properties) {
          if (typeof itemValue !== 'object' || itemValue === null) {
            itemValue = {};
            defaultValue[i] = itemValue;
          }

          for (const [key, propSchema] of Object.entries(itemSchema.properties)) {
            const propPath = `${itemPath}.${key}`;
            let propValue: JSONValue | undefined;
            if (isJSONObject(itemValue)) {
              const objValue = itemValue as Record<string, JSONValue>;
              if (key in objValue) {
                propValue = objValue[key];
              } else if (isJSONSchema(propSchema)) {
                if (propSchema.default !== undefined) {
                  propValue = convertFormValue(propSchema.default);
                } else if (propSchema.required) {
                  if (propSchema.type === 'object') {
                    propValue = {};
                    if (propSchema.properties) {
                      const nestedObj: Record<string, JSONValue> = {};
                      for (const [nestedKey, nestedSchema] of Object.entries(propSchema.properties)) {
                        if (isJSONSchema(nestedSchema)) {
                          if (nestedSchema.default !== undefined) {
                            nestedObj[nestedKey] = convertFormValue(nestedSchema.default);
                          } else if (nestedSchema.required) {
                            if (nestedSchema.type === 'string') {
                              nestedObj[nestedKey] = '';
                            } else if (nestedSchema.type === 'array') {
                              nestedObj[nestedKey] = [];
                            }
                          }
                        }
                      }
                      propValue = nestedObj;
                    }
                  } else if (propSchema.type === 'array') {
                    propValue = [];
                    if (propSchema.items && isJSONSchema(propSchema.items)) {
                      const itemSchema = propSchema.items;
                      if (itemSchema.default !== undefined) {
                        propValue = convertFormValue(itemSchema.default);
                      } else if (itemSchema.type === 'object' && itemSchema.properties) {
                        const obj: Record<string, JSONValue> = {};
                        for (const [nestedKey, nestedSchema] of Object.entries(itemSchema.properties)) {
                          if (isJSONSchema(nestedSchema)) {
                            if (nestedSchema.default !== undefined) {
                              obj[nestedKey] = convertFormValue(nestedSchema.default);
                            } else if (nestedSchema.required) {
                              if (nestedSchema.type === 'string') {
                                obj[nestedKey] = '';
                              } else if (nestedSchema.type === 'array') {
                                obj[nestedKey] = [];
                              } else if (nestedSchema.type === 'object') {
                                obj[nestedKey] = {};
                              }
                            }
                          }
                        }
                        if (itemSchema.default !== undefined) {
                          propValue = convertFormValue(itemSchema.default);
                        } else {
                          propValue = [{}];
                          if (itemSchema.type === 'object' && itemSchema.properties) {
                            const firstObj = propValue[0] as Record<string, JSONValue>;
                            for (const [key, propSchema] of Object.entries(itemSchema.properties)) {
                              if (isJSONSchema(propSchema)) {
                                if (propSchema.default !== undefined) {
                                  firstObj[key] = convertFormValue(propSchema.default);
                                } else if (propSchema.required) {
                                  if (propSchema.type === 'string') {
                                    firstObj[key] = '';
                                  } else if (propSchema.type === 'array') {
                                    firstObj[key] = [];
                                  } else if (propSchema.type === 'object') {
                                    firstObj[key] = {};
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  } else if (propSchema.type === 'string') {
                    propValue = '';
                  }
                }
              }
              if (propValue !== undefined) {
                objValue[key] = propValue;
              }
            }

            fields.set(propPath, {
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
    let defaultValue: JSONValue;
    if (schema.default !== undefined) {
      defaultValue = convertFormValue(schema.default);
    } else if (schema.type === 'string') {
      defaultValue = '';
    } else {
      defaultValue = undefined;
    }
    
    fields.set(path, {
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

function convertFormValue(value: JSONValue): JSONValue {
  if (Array.isArray(value)) {
    return value.map(item => convertFormValue(item));
  }
  if (typeof value === 'object' && value !== null) {
    const result: Record<string, JSONValue> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = convertFormValue(val);
    }
    return result;
  }
  return value;
}
