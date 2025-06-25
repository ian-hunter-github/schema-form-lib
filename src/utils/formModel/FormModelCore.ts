import type { JSONSchema, JSONValue } from "../../types/schema";
import type { FormField } from "./types";
import { buildFields } from "./schemaProcessor";
import { FormValidator } from "../FormValidator";

export class FormModelCore {
  protected fields: Map<string, FormField> = new Map();
  private listeners: Set<(fields: Map<string, FormField>) => void> = new Set();

  constructor(schema: JSONSchema) {
    this.buildForm(schema);
  }

  private buildForm(schema: JSONSchema) {
    this.fields = new Map();
    buildFields(this.fields, "", schema);
    this.notifyListeners();
  }

  public getField(path: string): FormField | undefined {
    // First try direct lookup
    const field = this.fields.get(path);
    if (field) return field;

    // Handle nested paths (arrays/objects)
    const parts = path.split('.');
    if (parts.length > 1) {
      let currentPath = '';
      let parentField: FormField | undefined = undefined;

      // Walk through each part of the path to ensure all intermediate fields exist
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}.${part}` : part;

        // Skip if we already have this field
        if (this.fields.has(currentPath)) {
          parentField = this.fields.get(currentPath);
          continue;
        }

        // Handle array indices
        if (!isNaN(Number(part))) {
          const arrayPath = parts.slice(0, i).join('.');
          const arrayField = this.fields.get(arrayPath);
          if (arrayField && arrayField.schema.type === 'array') {
            // Initialize array value if not already set
            if (!Array.isArray(arrayField.value)) {
              arrayField.value = [];
            }

            const index = parseInt(part, 10);
            
            // Only create field if the index exists in the array
            if (index >= 0 && index < arrayField.value.length) {
              const item = arrayField.value[index];
              const itemSchema = arrayField.schema.items;
              
              if (itemSchema) {
                // Initialize undefined array items with empty objects if schema is object type
                if (item === undefined && itemSchema.type === 'object') {
                  arrayField.value[index] = {};
                }
                
                this.fields.set(currentPath, {
                  path: currentPath,
                  value: arrayField.value[index],
                  schema: itemSchema,
                  errors: [],
                  errorCount: 0,
                  required: false,
                  dirty: false,
                  dirtyCount: 0,
                });
                parentField = this.fields.get(currentPath);
              }
            } else {
              // Index doesn't exist in array, return undefined
              return undefined;
            }
          }
        }
        // Handle object properties
        else if (parentField && parentField.schema.type === 'object' && parentField.schema.properties) {
          const propSchema = parentField.schema.properties[part];
          if (propSchema) {
            // Ensure parent object has this property
            if (typeof parentField.value === 'object' && parentField.value !== null) {
              if (!(part in parentField.value)) {
                (parentField.value as Record<string, JSONValue>)[part] = undefined;
              }
            }

            const propValue = typeof parentField.value === 'object' && parentField.value !== null
              ? (parentField.value as Record<string, JSONValue>)[part]
              : undefined;
            this.fields.set(currentPath, {
              path: currentPath,
              value: propValue,
              schema: propSchema,
              errors: [],
              errorCount: 0,
              required: propSchema.required || false,
              dirty: false,
              dirtyCount: 0,
            });
            parentField = this.fields.get(currentPath);
          }
        }
      }
    }

    return this.fields.get(path);
  }

  public getFields(): Map<string, FormField> {
    return new Map(this.fields);
  }

  public setValue(path: string, value: JSONValue): void {
    // First try to get the field normally
    let field = this.getField(path);
    
    // If field doesn't exist, we need to create it by expanding arrays/objects as needed
    if (!field) {
      field = this.createFieldPath(path, value);
    }

    if (field) {
      field.value = value;
      field.dirty = true;
      field.dirtyCount++;

      // If we're setting a complex object, create nested fields for validation
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && field.schema.type === 'object') {
        this.createNestedFields(path, value as Record<string, JSONValue>, field.schema);
      }

      // Also update the value in parent array/object structures
      if (path.includes('.')) {
        const parentPath = path.substring(0, path.lastIndexOf('.'));
        const parentField = this.fields.get(parentPath);
        if (parentField) {
          const propName = path.substring(path.lastIndexOf('.') + 1);
          
          // Update parent array/object structure
          if (Array.isArray(parentField.value)) {
            const index = parseInt(propName, 10);
            if (!isNaN(index)) {
              // Ensure array is large enough
              while (index >= parentField.value.length) {
                parentField.value.push(undefined);
              }
              parentField.value[index] = value;
            }
          } else if (typeof parentField.value === 'object' && parentField.value !== null) {
            (parentField.value as Record<string, JSONValue>)[propName] = value;
          }
        }
      }

      // Propagate dirty state up through all parent paths
      let currentPath = path;
      const changedPaths = new Set<string>();
      
      while (currentPath.includes('.')) {
        currentPath = currentPath.substring(0, currentPath.lastIndexOf('.'));
        const parentField = this.fields.get(currentPath);
        if (parentField) {
          parentField.dirty = true;
          // Only increment dirtyCount once per change propagation
          if (!changedPaths.has(currentPath)) {
            parentField.dirtyCount++;
            changedPaths.add(currentPath);
          }
        }
      }

      this.notifyListeners();
    }
  }

  private createFieldPath(path: string, value: JSONValue): FormField | undefined {
    const parts = path.split('.');
    let currentPath = '';
    let parentField: FormField | undefined = undefined;

    // Walk through each part of the path and create missing fields
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}.${part}` : part;

      // If field already exists, continue
      if (this.fields.has(currentPath)) {
        parentField = this.fields.get(currentPath);
        continue;
      }

      // Handle array indices
      if (!isNaN(Number(part))) {
        const arrayPath = parts.slice(0, i).join('.');
        const arrayField = this.fields.get(arrayPath);
        if (arrayField && arrayField.schema.type === 'array') {
          // Initialize array value if not already set
          if (!Array.isArray(arrayField.value)) {
            arrayField.value = [];
          }

          const index = parseInt(part, 10);
          const itemSchema = arrayField.schema.items;
          
          if (itemSchema) {
            // Expand array to include this index
            while (index >= arrayField.value.length) {
              if (itemSchema.type === 'object') {
                arrayField.value.push({});
              } else {
                arrayField.value.push(undefined);
              }
            }
            
            // Create field for this array item
            this.fields.set(currentPath, {
              path: currentPath,
              value: arrayField.value[index],
              schema: itemSchema,
              errors: [],
              errorCount: 0,
              required: false,
              dirty: false,
              dirtyCount: 0,
            });
            parentField = this.fields.get(currentPath);

            // If this is the final part and we're setting a complex value, update the array
            if (i === parts.length - 1 && typeof value === 'object' && value !== null) {
              arrayField.value[index] = value;
              parentField!.value = value;
            }
          }
        }
      }
      // Handle object properties
      else if (parentField && parentField.schema.type === 'object' && parentField.schema.properties) {
        const propSchema = parentField.schema.properties[part];
        if (propSchema) {
          // Ensure parent object has this property
          if (typeof parentField.value === 'object' && parentField.value !== null) {
            if (!(part in parentField.value)) {
              (parentField.value as Record<string, JSONValue>)[part] = undefined;
            }
          }

          let propValue = typeof parentField.value === 'object' && parentField.value !== null
            ? (parentField.value as Record<string, JSONValue>)[part]
            : undefined;

          // If this is the final part, use the provided value
          if (i === parts.length - 1) {
            propValue = value;
            if (typeof parentField.value === 'object' && parentField.value !== null) {
              (parentField.value as Record<string, JSONValue>)[part] = value;
            }
          }

          this.fields.set(currentPath, {
            path: currentPath,
            value: propValue,
            schema: propSchema,
            errors: [],
            errorCount: 0,
            required: propSchema.required || false,
            dirty: false,
            dirtyCount: 0,
          });
          parentField = this.fields.get(currentPath);
        }
      }
    }

    // After creating the field path, if we set a complex object, we need to create nested fields
    const finalField = this.fields.get(path);
    if (finalField && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      this.createNestedFields(path, value, finalField.schema);
    }

    return this.fields.get(path);
  }

  private createNestedFields(basePath: string, obj: Record<string, JSONValue>, schema: JSONSchema): void {
    if (schema.type === 'object' && schema.properties) {
      for (const [key, propValue] of Object.entries(obj)) {
        const propPath = `${basePath}.${key}`;
        const propSchema = schema.properties[key];
        
        if (propSchema) {
          // Create or update the field (don't skip if it already exists)
          this.fields.set(propPath, {
            path: propPath,
            value: propValue,
            schema: propSchema,
            errors: [],
            errorCount: 0,
            required: propSchema.required || false,
            dirty: false,
            dirtyCount: 0,
          });

          // Recursively create nested fields if this property is also an object
          if (typeof propValue === 'object' && propValue !== null && !Array.isArray(propValue) && propSchema.type === 'object') {
            this.createNestedFields(propPath, propValue as Record<string, JSONValue>, propSchema);
          }
          // Handle arrays within objects
          else if (Array.isArray(propValue) && propSchema.type === 'array' && propSchema.items) {
            this.createArrayFields(propPath, propValue, propSchema);
          }
        }
      }
    }
  }

  private createArrayFields(arrayPath: string, arrayValue: JSONValue[], arraySchema: JSONSchema): void {
    const itemSchema = arraySchema.items;
    if (!itemSchema) return;

    for (let i = 0; i < arrayValue.length; i++) {
      const itemPath = `${arrayPath}.${i}`;
      const itemValue = arrayValue[i];

      if (!this.fields.has(itemPath)) {
        this.fields.set(itemPath, {
          path: itemPath,
          value: itemValue,
          schema: itemSchema,
          errors: [],
          errorCount: 0,
          required: false,
          dirty: false,
          dirtyCount: 0,
        });

        // Recursively create nested fields if array item is an object
        if (typeof itemValue === 'object' && itemValue !== null && !Array.isArray(itemValue) && itemSchema.type === 'object') {
          this.createNestedFields(itemPath, itemValue as Record<string, JSONValue>, itemSchema);
        }
        // Handle nested arrays
        else if (Array.isArray(itemValue) && itemSchema.type === 'array' && itemSchema.items) {
          this.createArrayFields(itemPath, itemValue, itemSchema);
        }
      }
    }
  }

  public validate(): boolean {
    const errors = FormValidator.validateAll(this.fields);
    const isValid = Object.keys(errors).length === 0;

    // First clear all existing errors
    for (const field of this.fields.values()) {
      field.errors = [];
      field.errorCount = 0;
    }

    // Apply errors to fields
    for (const [path, fieldErrors] of Object.entries(errors)) {
      // Ensure the field exists before applying errors
      this.getField(path);
      
      const field = this.fields.get(path);
      if (field) {
        field.errors = fieldErrors;
        field.errorCount = fieldErrors.length;

        // Propagate errors up through all parent paths
        let currentPath = path;
        while (currentPath.includes('.')) {
          currentPath = currentPath.substring(0, currentPath.lastIndexOf('.'));
          const parentField = this.fields.get(currentPath);
          if (parentField) {
            parentField.errorCount += fieldErrors.length;
            parentField.errors = [...new Set([...parentField.errors, ...fieldErrors])];
          }
        }
      }
    }

    console.log('Validation results:', {
      isValid,
      errors: Object.fromEntries(Object.entries(errors).filter(([, e]) => e.length > 0))
    });

    this.notifyListeners();
    return isValid;
  }

  public addValue(arrayPath: string, value: JSONValue): string {
    const arrayField = this.fields.get(arrayPath);
    if (!arrayField || arrayField.schema.type !== 'array') {
      throw new Error(`Cannot add value to non-array field at path: ${arrayPath}`);
    }

    if (!Array.isArray(arrayField.value)) {
      arrayField.value = [];
    }

    const newIndex = arrayField.value.length;
    arrayField.value.push(value);
    const newPath = `${arrayPath}.${newIndex}`;

    // Create new field for the array item
    if (arrayField.schema.items) {
      this.fields.set(newPath, {
        path: newPath,
        value: value,
        schema: arrayField.schema.items,
        errors: [],
        errorCount: 0,
        required: false,
        dirty: true,
        dirtyCount: 0
      });
    }

    this.notifyListeners();
    return newPath;
  }

  public deleteValue(elementPath: string): number {
    const parts = elementPath.split('.');
    const index = parseInt(parts[parts.length - 1], 10);
    const arrayPath = parts.slice(0, -1).join('.');

    const arrayField = this.fields.get(arrayPath);
    if (!arrayField || arrayField.schema.type !== 'array' || !Array.isArray(arrayField.value)) {
      throw new Error(`Cannot delete from non-array field at path: ${arrayPath}`);
    }

    // Remove the item from the array
    arrayField.value.splice(index, 1);

    // Remove all fields for this array index and its children
    for (const [path] of this.fields) {
      if (path.startsWith(`${arrayPath}.${index}`)) {
        this.fields.delete(path);
      }
    }

    // Update paths for remaining items
    for (let i = index; i < arrayField.value.length; i++) {
      const oldPath = `${arrayPath}.${i + 1}`;
      const newPath = `${arrayPath}.${i}`;

      for (const [path, field] of this.fields) {
        if (path.startsWith(oldPath)) {
          this.fields.delete(path);
          const newFieldPath = path.replace(oldPath, newPath);
          this.fields.set(newFieldPath, {
            ...field,
            path: newFieldPath
          });
        }
      }
    }

    this.notifyListeners();
    return arrayField.value.length;
  }

  public addListener(listener: (fields: Map<string, FormField>) => void): void {
    this.listeners.add(listener);
  }

  public removeListener(listener: (fields: Map<string, FormField>) => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.fields);
    }
  }

  // [Other private methods...]
}
