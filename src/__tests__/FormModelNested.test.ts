import { describe, it, expect } from "vitest";
import { FormModel } from "../utils/FormModel";
import { VALIDATION_MESSAGES } from "../utils/validationMessages";
import type { JSONSchemaProperties } from "../types/schema";

describe("FormModel - Nested Structures", () => {
  it("should handle array of objects with nested arrays", () => {
    const schema: JSONSchemaProperties = {
      departments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            employees: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  skills: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
      },
    };
    const model = new FormModel(schema);
    console.debug(
      "Initial model created with schema:",
      JSON.stringify(schema, null, 2)
    );
    console.debug(
      "Initial departments value:",
      model.getField("departments")?.value
    );

    // Test initial state
    expect(model.getField("departments")?.value).toEqual([]);

    // Add department with nested structure
    console.debug("Setting departments.0 with nested structure");

    model.setValue("departments.0", {
      name: "Engineering",
      employees: [{ name: "Alice", skills: ["JavaScript", "TypeScript"] }],
    });

    console.debug("After setting departments.0:", {
      name: model.getField("departments.0.name")?.value,
      employees: model.getField("departments.0.employees")?.value,
    });

    expect(model.getField("departments.0.name")?.value).toBe("Engineering");
    console.debug("Nested employee data:", {
      name: model.getField("departments.0.employees.0.name")?.value,
      skills: model.getField("departments.0.employees.0.skills")?.value,
    });

    expect(model.getField("departments.0.employees.0.name")?.value)?.toBe(
      "Alice"
    );
    expect(model.getField("departments.0.employees.0.skills.0")?.value)?.toBe(
      "JavaScript"
    );
    expect(model.getField("departments.0.employees.0.skills.1")?.value)?.toBe(
      "TypeScript"
    );
  });

  it("should handle array of objects with nested arrays 2", () => {
    const schema: JSONSchemaProperties = {
      departments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            employees: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  skills: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
      },
    };
    const model = new FormModel(schema);

    //console.debug('Initial departments value:', model.getField('departments')?.value);

    // Test initial state
    // expect(model.getField('departments')?.value).toEqual([]);

    // Add department with nested structure
    // console.debug('Setting departments.0 with nested structure');

    model.setValue("departments.0", {
      name: "Engineering",
      employees: [{ name: "Alice" }],
    });

    console.debug("After setting departments.0:", {
      name: model.getField("departments.0.employees.0.name")?.value,
    });

    expect(model.getField("departments.0.name")?.value).toBe("Engineering");
    expect(model.getField("departments.0.employees.0.name")?.value).toBe(
      "Alice"
    );
  });

  it("should handle deeply nested object hierarchies", () => {
    const schema: JSONSchemaProperties = {
      company: {
        type: "object",
        properties: {
          name: { type: "string" },
          divisions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                teams: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      members: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const model = new FormModel(schema);

    // Test initial state
    expect(model.getField("company.divisions")?.value)?.toStrictEqual([]);

    // Set deep nested value
    model.setValue("company.divisions.0.teams.0.members.0", "Bob");
    expect(model.getField("company.divisions.0.teams.0.members.0")?.value).toBe(
      "Bob"
    );
  });

  it("should handle mixed arrays with different types", () => {
    const schema: JSONSchemaProperties = {
      mixedArray: {
        type: "array",
        items: {
          type: "object",
          properties: {
            stringValue: { type: "string" },
            objectValue: {
              type: "object",
              properties: {
                type: { type: "string" },
                value: { type: "number" },
              },
            },
          },
        },
      },
    };
    const model = new FormModel(schema);

    model.setValue("mixedArray.0.stringValue", "text");
    model.setValue("mixedArray.1.objectValue", { type: "number", value: 42 });

    expect(model.getField("mixedArray.0.stringValue")?.value).toBe("text");
    expect(model.getField("mixedArray.1.objectValue.type")?.value).toBe(
      "number"
    );
    expect(model.getField("mixedArray.1.objectValue.value")?.value).toBe(42);
  });

  it("should validate nested structures", () => {
    // Create a simpler test case focusing just on validation
    const schema: JSONSchemaProperties = {
      product: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 3 },
          sku: { type: "string", maxLength: 7 },
          price: { type: "number", minimum: 0 },
        },
      },
    };

    const model = new FormModel(schema);
    model.setValue("product", {
      name: "AB", // Too short
      sku: "too-long-sku", // Too long
      price: -10, // Below minimum
    });

    const isValid = model.validate();
    expect(isValid).toBe(false);

    const errors = model.getField("product")?.errors;
    console.log("Validation errors:", errors);

    expect(errors).toContain(VALIDATION_MESSAGES.MIN_LENGTH(3));
    expect(errors).toContain(VALIDATION_MESSAGES.MAX_LENGTH(7));
    expect(errors).toContain(VALIDATION_MESSAGES.MIN_NUMBER(0));

    expect(model.getField("product.name")?.errors).toContain(VALIDATION_MESSAGES.MIN_LENGTH(3));
    expect(model.getField("product.sku")?.errors).toContain(VALIDATION_MESSAGES.MAX_LENGTH(7));
    expect(model.getField("product.price")?.errors).toContain(VALIDATION_MESSAGES.MIN_NUMBER(0));

  });

  it("should validate nested array structures", () => {
    // Simplified test case focusing just on array validation
    const schema: JSONSchemaProperties = {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 3 },
            sku: { type: "string", maxLength: 7 },
          },
        },
      },
    };

    const model = new FormModel(schema);

    // Set invalid values
    model.setValue("items.0.name", "AB"); // Too short
    model.setValue("items.0.sku", "too-long-sku"); // Too long

    const isValid = model.validate();
    expect(isValid).toBe(false);

    const nameErrors = model.getField("items.0.name")?.errors;
    const skuErrors = model.getField("items.0.sku")?.errors;

    console.log("Name errors:", nameErrors);
    console.log("SKU errors:", skuErrors);

    expect(nameErrors).toContain(VALIDATION_MESSAGES.MIN_LENGTH(3));
    expect(skuErrors).toContain(VALIDATION_MESSAGES.MAX_LENGTH(7));
  });

  it("should validate deeply nested array structures", () => {
    const schema: JSONSchemaProperties = {
      products: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              minLength: 3,
            },
            variants: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sku: {
                    type: "string",
                    maxLength: 7,
                  },
                  price: {
                    type: "number",
                    minimum: 0
                  }
                }
              }
            }
          }
        }
      }
    };

    const model = new FormModel(schema);
    const testValue = {
      name: "AB", // Too short
      variants: [
        {
          sku: "too-long-sku", // Too long
          price: -10 // Below minimum
        }
      ]
    };

    // Set values
    model.setValue("products.0", testValue);

    // Validate
    const isValid = model.validate();
    expect(isValid).toBe(false);

    // Check errors
    expect(model.getField("products.0.name")?.errors).toContain(
      VALIDATION_MESSAGES.MIN_LENGTH(3)
    );
    expect(model.getField("products.0.variants.0.sku")?.errors).toContain(
      VALIDATION_MESSAGES.MAX_LENGTH(7)
    );
    expect(model.getField("products.0.variants.0.price")?.errors).toContain(
      VALIDATION_MESSAGES.MIN_NUMBER(0)
    );
  });

  it("should track dirty state in nested structures", () => {
    const schema: JSONSchemaProperties = {
      project: {
        type: "object",
        properties: {
          name: { type: "string" },
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                completed: { type: "boolean" },
                subtasks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      done: { type: "boolean" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const model = new FormModel(schema);

    // Initial state
    expect(model.getField("project")?.dirtyCount).toBe(0);

    // Modify nested values at different levels
    model.setValue("project.name", "New Project");
    model.setValue("project.tasks.0.title", "Initial setup");
    model.setValue("project.tasks.0.subtasks.0.name", "First subtask");
    model.setValue("project.tasks.0.subtasks.1.done", true);

    // Verify dirty state propagates correctly
    expect(model.getField("project")?.dirtyCount).toBe(4);
    expect(model.getField("project.name")?.dirty).toBe(true);
    expect(model.getField("project.tasks")?.dirty).toBe(true);
    expect(model.getField("project.tasks.0.title")?.dirty).toBe(true);
    expect(model.getField("project.tasks.0.subtasks.0.name")?.dirty).toBe(true);
    expect(model.getField("project.tasks.0.subtasks.1.done")?.dirty).toBe(true);

    // Verify parent objects are marked dirty
    expect(model.getField("project.tasks.0")?.dirty).toBe(true);
    expect(model.getField("project.tasks.0.subtasks.0")?.dirty).toBe(true);
    expect(model.getField("project.tasks.0.subtasks.1")?.dirty).toBe(true);
  });
});
