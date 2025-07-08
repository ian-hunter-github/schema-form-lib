import type { JSONSchema, JSONValue } from '../../../types/schema';
import type { FormField } from '../../../types/fields';
import { PathResolver } from '../pathResolution/PathResolver';
import { PathBuilder } from '../pathResolution/PathBuilder';
import { FieldCreatorFactory } from '../fieldCreation/FieldCreatorFactory';
import { SchemaAnalyzer } from '../valueHandling/SchemaAnalyzer';
import { isJSONObject } from '../schemaUtils';

export class DynamicFieldResolver {
  static resolveField(
    fields: Map<string, FormField>,
    path: string
  ): FormField | undefined {
    // First try direct lookup
    const field = fields.get(path);
    if (field) return field;

    // If not found and it's a nested path, try to create it dynamically
    if (PathResolver.isNestedPath(path)) {
      return this.createDynamicField(fields, path);
    }

    return undefined;
  }

  private static createDynamicField(
    fields: Map<string, FormField>,
    path: string
  ): FormField | undefined {
    const pathSegments = PathResolver.parsePath(path);
    let currentPath = '';
    let parentField: FormField | undefined = undefined;

    // Walk through each segment to build up the path
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath = PathBuilder.buildChildPath(currentPath, segment);

      // If this segment already exists, continue
      if (fields.has(currentPath)) {
        parentField = fields.get(currentPath);
        continue;
      }

      // Try to create this segment
      if (PathResolver.isArrayIndex(segment)) {
        parentField = this.createArrayItemField(fields, currentPath, parentField, parseInt(segment, 10));
      } else {
        parentField = this.createObjectPropertyField(fields, currentPath, parentField, segment);
      }

      if (!parentField) {
        return undefined; // Could not create the field
      }
    }

    return fields.get(path);
  }

  private static createArrayItemField(
    fields: Map<string, FormField>,
    itemPath: string,
    arrayField: FormField | undefined,
    index: number
  ): FormField | undefined {
    if (!arrayField || !SchemaAnalyzer.isArraySchema(arrayField.schema)) {
      return undefined;
    }

    // Ensure array value exists and is large enough
    if (!Array.isArray(arrayField.value)) {
      arrayField.value = [];
    }

    // Only create field if the index exists in the array
    if (index < 0 || index >= arrayField.value.length) {
      return undefined;
    }

    const itemSchema = SchemaAnalyzer.getArrayItemSchema(arrayField.schema);
    if (!itemSchema) return undefined;

    const itemValue = arrayField.value[index];
    
    // Create the field for this array item
    const field = FieldCreatorFactory.createField(fields, itemPath, itemSchema, itemValue);
    
    return field;
  }

  private static createObjectPropertyField(
    fields: Map<string, FormField>,
    propertyPath: string,
    objectField: FormField | undefined,
    propertyName: string
  ): FormField | undefined {
    if (!objectField || !SchemaAnalyzer.isObjectSchema(objectField.schema)) {
      return undefined;
    }

    const properties = objectField.schema.properties;
    if (!properties || !(propertyName in properties)) {
      return undefined;
    }

    const propertySchema = properties[propertyName] as JSONSchema;
    
    // Ensure object value exists
    if (!isJSONObject(objectField.value)) {
      objectField.value = {};
    }

    const objectValue = objectField.value as Record<string, JSONValue>;
    let propertyValue = objectValue[propertyName];

    // Initialize property if it doesn't exist
    if (propertyValue === undefined) {
      if (propertySchema.default !== undefined) {
        propertyValue = propertySchema.default;
      } else if (SchemaAnalyzer.isObjectSchema(propertySchema)) {
        propertyValue = {};
      } else if (SchemaAnalyzer.isArraySchema(propertySchema)) {
        propertyValue = [];
      } else if (propertySchema.type === 'string') {
        propertyValue = '';
      }
      
      objectValue[propertyName] = propertyValue;
    }

    // Create the field for this property
    const field = FieldCreatorFactory.createField(fields, propertyPath, propertySchema, propertyValue);
    
    return field;
  }

  static expandArrayToIndex(
    fields: Map<string, FormField>,
    arrayPath: string,
    targetIndex: number
  ): boolean {
    const arrayField = fields.get(arrayPath);
    if (!arrayField || !SchemaAnalyzer.isArraySchema(arrayField.schema)) {
      return false;
    }

    if (!Array.isArray(arrayField.value)) {
      arrayField.value = [];
    }

    const itemSchema = SchemaAnalyzer.getArrayItemSchema(arrayField.schema);
    if (!itemSchema) return false;

    // Expand array to include the target index
    while (arrayField.value.length <= targetIndex) {
      const newIndex = arrayField.value.length;
      let defaultValue: JSONValue;

      if (SchemaAnalyzer.isObjectSchema(itemSchema)) {
        defaultValue = {};
      } else if (SchemaAnalyzer.isArraySchema(itemSchema)) {
        defaultValue = [];
      } else {
        defaultValue = undefined;
      }

      arrayField.value.push(defaultValue);

      // Create field for the new item
      const itemPath = PathBuilder.buildArrayItemPath(arrayPath, newIndex);
      FieldCreatorFactory.createField(fields, itemPath, itemSchema, defaultValue);
    }

    return true;
  }

  static ensureObjectProperty(
    fields: Map<string, FormField>,
    objectPath: string,
    propertyName: string
  ): boolean {
    const objectField = fields.get(objectPath);
    if (!objectField || !SchemaAnalyzer.isObjectSchema(objectField.schema)) {
      return false;
    }

    if (!isJSONObject(objectField.value)) {
      objectField.value = {};
    }

    const objectValue = objectField.value as Record<string, JSONValue>;
    if (propertyName in objectValue) {
      return true; // Already exists
    }

    const properties = objectField.schema.properties;
    if (!properties || !(propertyName in properties)) {
      return false; // Property not defined in schema
    }

    const propertySchema = properties[propertyName] as JSONSchema;
    const propertyPath = PathBuilder.buildPropertyPath(objectPath, propertyName);
    
    // Create the property field
    FieldCreatorFactory.createField(fields, propertyPath, propertySchema);
    
    return true;
  }
}
