import type { JSONSchema } from '../../../types/schema';
import { PathBuilder } from './PathBuilder';

export class SchemaPathExtractor {
  private static readonly SCHEMA_COMBINERS = ['oneOf', 'anyOf', 'allOf', 'not', 'properties'] as const;

  static getPaths(schema: JSONSchema, basePath = ''): string[] {
    const paths: string[] = [];
    
    if (schema.type === 'object') {
      // Handle direct properties
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          const currentPath = PathBuilder.buildChildPath(basePath, key);
          if (!this.isObjectSchema(propSchema)) {
            paths.push(currentPath);
          } else {
            paths.push(...this.getPaths(propSchema, currentPath));
          }
        }
      }

      // Handle schema combiners (oneOf/anyOf/allOf/not)
      for (const combiner of this.SCHEMA_COMBINERS) {
        if (combiner === 'properties') continue; // Skip properties as it's handled separately
        
        const items = schema[combiner as keyof JSONSchema];
        if (!items) continue;

        const variants = Array.isArray(items) ? items : [items];
        for (const variant of variants) {
          if (this.isObjectSchema(variant)) {
            // Process variant's properties with parent path
            if (variant.properties) {
              for (const [key, propSchema] of Object.entries(variant.properties)) {
                const currentPath = PathBuilder.buildChildPath(basePath, key);
                if (!this.isObjectSchema(propSchema)) {
                  paths.push(currentPath);
                } else {
                  paths.push(...this.getPaths(propSchema, currentPath));
                }
              }
            }
            // Recursively process any combiners within the variant
            paths.push(...this.getPaths(variant, basePath));
          }
        }
      }
    }
    return [...new Set(paths)]; // Remove duplicates
  }

  private static isObjectSchema(schema: unknown): schema is JSONSchema & { 
    type: 'object'
  } {
    if (!schema || typeof schema !== 'object') return false;
    const jsonSchema = schema as JSONSchema;
    return jsonSchema.type === 'object' && 
           (!!jsonSchema.properties || 
            !!jsonSchema.oneOf || 
            !!jsonSchema.anyOf || 
            !!jsonSchema.allOf);
  }
}
