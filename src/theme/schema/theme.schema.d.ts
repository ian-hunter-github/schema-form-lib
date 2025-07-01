declare module "../../theme/schema/theme.schema.json" {
  const value: {
    $schema: string;
    title: string;
    description: string;
    type: string;
    properties: Record<string, {
      type?: string;
      description?: string;
      properties?: Record<string, unknown>;
      required?: string[] | boolean;
      default?: unknown;
    }>;
    required: string[];
  };
  export = value;
}
