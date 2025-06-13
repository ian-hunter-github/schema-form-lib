import { describe, it, expect } from "vitest";
import { FormValidator } from "../utils/FormValidator";
import type { JSONSchemaProperties } from "../types/schema";

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
      expect(errors).toContain("Must be at least 3 characters.");
    });

    it("validates string field with maxLength", () => {
      const errors = FormValidator.validateField(schema, "name", "a".repeat(21));
      expect(errors).toContain("Must be no more than 20 characters.");
    });

    it("validates number field with minimum", () => {
      const errors = FormValidator.validateField(schema, "age", 17);
      expect(errors).toContain("Must be at least 18.");
    });

    it("validates number field with maximum", () => {
      const errors = FormValidator.validateField(schema, "age", 121);
      expect(errors).toContain("Must be no more than 120.");
    });

    it("returns empty array for valid field", () => {
      const errors = FormValidator.validateField(schema, "name", "valid");
      expect(errors).toEqual([]);
    });

    it("returns empty array for readOnly field", () => {
      const errors = FormValidator.validateField(schema, "readOnlyField", "value");
      expect(errors).toEqual([]);
    });

    it("returns required error for empty string", () => {
      const errors = FormValidator.validateField(schema, "name", "");
      expect(errors).toContain("This field is required.");
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
      expect(errors["person.name"]).toContain("Must be at least 2 characters.");
      expect(errors["person.age"]).toBeDefined();
      expect(errors["person.age"]).toContain("Must be at least 18.");
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
      expect(errors["username"]).toContain("Must be at least 3 characters.");
      expect(errors["profile.bio"]).toBeDefined();
      expect(errors["profile.bio"]).toContain("Must be no more than 100 characters.");
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
  });
});
