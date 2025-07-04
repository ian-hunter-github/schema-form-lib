import { describe, it, expect } from "vitest";
import { FormValidator } from "../utils/form/FormValidator/FormValidator";
import { VALIDATION_MESSAGES } from "../utils/form/FormValidator/validationMessages";
import type { JSONSchemaProperties, JSONSchema, JSONValue } from "../types/schema";
import type { FormField } from "../utils/form/types";

describe("FormValidator", () => {
  describe("validateField", () => {
    const schema: JSONSchemaProperties = {
      name: {
        type: "string",
        minLength: 3,
        maxLength: 20
      },
      age: {
        type: "number",
        minimum: 18,
        maximum: 120
      },
      address: {
        type: "object",
        properties: {
          street: { type: "string" },
          city: { type: "string" }
        }
      },
      readOnlyField: {
        type: "string",
        readOnly: true
      }
    };

    it("validates string field with minLength", () => {
      const errors = FormValidator.validateField(schema, "name", "ab");
      expect(errors).toContain(VALIDATION_MESSAGES.MIN_LENGTH(3));
    });

    it("validates string field with maxLength", () => {
      const errors = FormValidator.validateField(schema, "name", "a".repeat(21));
      expect(errors).toContain(VALIDATION_MESSAGES.MAX_LENGTH(20));
    });

    it("validates number field with minimum", () => {
      const errors = FormValidator.validateField(schema, "age", 17);
      expect(errors).toContain(VALIDATION_MESSAGES.MIN_NUMBER(18));
    });

    it("validates number field with maximum", () => {
      const errors = FormValidator.validateField(schema, "age", 121);
      expect(errors).toContain(VALIDATION_MESSAGES.MAX_NUMBER(120));
    });

    it("returns empty array for valid field", () => {
      const errors = FormValidator.validateField(schema, "name", "valid");
      expect(errors).toEqual([]);
    });

    it("returns empty array for readOnly field", () => {
      const errors = FormValidator.validateField(schema, "readOnlyField", "value");
      expect(errors).toEqual([]);
    });

    // it("returns required error for empty string", () => {
    //   const errors = FormValidator.validateField(schema, "name", "");
    //   expect(errors).toContain("This field is required.");
    // });

    it("returns required error for missing nested field", () => {
      const nestedSchema: JSONSchemaProperties = {
        address: {
          type: "object",
          properties: {
            city: { 
              type: "string",
              minLength: 1 // Make it effectively required
            }
          }
        }
      };
      const errors = FormValidator.validateField(nestedSchema, "address.city", "");
      expect(errors).toContain(VALIDATION_MESSAGES.REQUIRED);
    });

  });

  describe("validateObject", () => {
    const schema: JSONSchemaProperties = {
      person: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2 },
          age: { type: "number", minimum: 18 }
        }
      }
    };

    it("validates nested object fields", () => {
      const errors = FormValidator.validateObject(
        schema,
        {
          person: {
            name: "a", // too short
            age: 17 // too young
          }
        },
        ""
      );

      expect(errors["person.name"]).toBeDefined();
      expect(errors["person.name"]).toContain(VALIDATION_MESSAGES.MIN_LENGTH(2));
      expect(errors["person.age"]).toBeDefined();
      expect(errors["person.age"]).toContain(VALIDATION_MESSAGES.MIN_NUMBER(18));
    });

    it("returns empty object for valid nested fields", () => {
      const errors = FormValidator.validateObject(
        schema,
        {
          person: {
            name: "valid",
            age: 18
          }
        },
        ""
      );

      expect(errors).toEqual({});
    });

    it("validates required nested fields in objects", () => {
      const schemaWithRequired: JSONSchemaProperties = {
        person: {
          type: "object",
          properties: {
            name: { 
              type: "string",
              minLength: 1 // Make it effectively required
            },
            age: { type: "number" }
          }
        }
      };

      const errors = FormValidator.validateObject(
        schemaWithRequired,
        {
          person: {
            age: 18, // missing required name
            name: "" // empty string should trigger required error
          }
        },
        ""
      );

      expect(errors["person.name"]).toBeDefined();
      expect(errors["person.name"]).toContain(VALIDATION_MESSAGES.REQUIRED);
    });
  });

  describe("validateForm", () => {
    const schema: JSONSchemaProperties = {
      username: { type: "string", minLength: 3 },
      email: { type: "string" },
      profile: {
        type: "object",
        properties: {
          bio: { type: "string", maxLength: 100 }
        }
      }
    };

    it("validates top-level and nested fields", () => {
      const errors = FormValidator.validateForm(
        {
          username: "ab", // too short
          email: "valid@example.com",
          profile: {
            bio: "a".repeat(101) // too long
          }
        },
        schema
      );

      expect(errors["username"]).toBeDefined();
      expect(errors["username"]).toContain(VALIDATION_MESSAGES.MIN_LENGTH(3));
      expect(errors["profile.bio"]).toBeDefined();
      expect(errors["profile.bio"]).toContain(VALIDATION_MESSAGES.MAX_LENGTH(100));
      expect(errors["email"]).toBeUndefined();
    });

    it("returns empty object for valid form", () => {
      const errors = FormValidator.validateForm(
        {
          username: "valid",
          email: "valid@example.com",
          profile: {
            bio: "valid bio"
          }
        },
        schema
      );

      expect(errors).toEqual({});
    });

    it("validates deeply nested required fields", () => {
      const deepSchema: JSONSchemaProperties = {
        user: {
          type: "object",
          properties: {
            profile: {
              type: "object",
              properties: {
                address: {
                  type: "object",
                  properties: {
                    city: { 
                      type: "string",
                      minLength: 1 // Make it effectively required
                    }
                  }
                }
              }
            }
          }
        }
      };

      const errors = FormValidator.validateForm(
        {
          user: {
            profile: {
              address: {
                city: "" // empty string should trigger required error
              }
            }
          }
        },
        deepSchema
      );

      expect(errors["user.profile.address.city"]).toBeDefined();
      expect(errors["user.profile.address.city"]).toContain(VALIDATION_MESSAGES.REQUIRED);
    });
  });

  describe("validateAll", () => {
      function createField(
      path: string, 
      schema: JSONSchema,
      value: JSONValue,
      required = false
    ): FormField {
      return {
        path,
        value,
        schema: {
          ...schema,
          isRequired: required
        },
        errors: [],
        errorCount: 0,
        required,
        dirty: false,
        dirtyCount: 0,
        pristineValue: value,
        hasChanges: false,
        lastModified: new Date()
      };
    }

    it("validates all fields in a form model", () => {
      const fields = new Map<string, FormField>([
        ["name", createField("name", { type: "string", minLength: 3 }, "ab")],
        ["age", createField("age", { type: "number", minimum: 18 }, 17)],
        ["email", createField("email", { type: "string" }, "valid@test.com")]
      ]);

      const errors = FormValidator.validateAll(fields);
      
      expect(errors["name"]).toContain(VALIDATION_MESSAGES.MIN_LENGTH(3));
      expect(errors["age"]).toContain(VALIDATION_MESSAGES.MIN_NUMBER(18));
      expect(errors["email"]).toBeUndefined();
    });

    it("validates nested object fields", () => {
      const fields = new Map<string, FormField>([
        ["person", createField("person", { 
          type: "object",
          properties: {
            name: { type: "string", minLength: 2 },
            age: { type: "number", minimum: 18 }
          }
        }, { name: "a", age: 17 })],
        ["person.name", createField("person.name", { type: "string", minLength: 2 }, "a")],
        ["person.age", createField("person.age", { type: "number", minimum: 18 }, 17)]
      ]);

      const errors = FormValidator.validateAll(fields);

      expect(errors["person.name"]).toContain(VALIDATION_MESSAGES.MIN_LENGTH(2));
      expect(errors["person.age"]).toContain(VALIDATION_MESSAGES.MIN_NUMBER(18));
    });

    it("validates array fields", () => {
      const fields = new Map<string, FormField>([
        ["items", createField("items", { 
          type: "array",
          items: { type: "string", minLength: 3 }
        }, ["ab", "valid"])],
        ["items.0", createField("items.0", { type: "string", minLength: 3 }, "ab")],
        ["items.1", createField("items.1", { type: "string", minLength: 3 }, "valid")]
      ]);

      const errors = FormValidator.validateAll(fields);

      expect(errors["items.0"]).toContain(VALIDATION_MESSAGES.MIN_LENGTH(3));
      expect(errors["items.1"]).toBeUndefined();
    });

    it("skips readOnly fields", () => {
      const fields = new Map<string, FormField>([
        ["name", createField("name", { type: "string", minLength: 3, readOnly: true }, "ab")],
        ["age", createField("age", { type: "number", minimum: 18 }, 17)]
      ]);

      const errors = FormValidator.validateAll(fields);

      expect(errors["name"]).toBeUndefined();
      expect(errors["age"]).toBeDefined();
    });
  });
});
