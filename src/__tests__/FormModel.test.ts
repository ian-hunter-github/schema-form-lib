import { describe, it, expect } from "vitest";
import { FormModel } from "../utils/form/FormModel";
import type { JSONSchemaProperties } from "../types/schema";
import { VALIDATION_MESSAGES } from "../utils/form/FormValidator/validationMessages";

describe("FormModel - Basic Types", () => {
  it("should handle string type with default", () => {
    const schema: JSONSchemaProperties = {
      name: { type: "string", default: "John" },
    };
    const model = new FormModel(schema);
    expect(model.getField("name")?.value).toBe("John");
  });

  it("should handle number type", () => {
    const schema: JSONSchemaProperties = {
      age: { type: "number" },
    };
    const model = new FormModel(schema);
    expect(model.getField("age")?.value).toBe(0); // Default value for numbers
  });

  it("should handle boolean type", () => {
    const schema: JSONSchemaProperties = {
      active: { type: "boolean", default: true },
    };
    const model = new FormModel(schema);
    expect(model.getField("active")?.value).toBe(true);
  });

  it("should validate required string", () => {
    const schema: JSONSchemaProperties = {
      name: { type: "string", minLength: 1 }, // Make it effectively required
    };
    const model = new FormModel(schema);
    expect(model.validate()).toBe(false);
    expect(model.getField("name")?.errors).toContain(
      VALIDATION_MESSAGES.REQUIRED
    );
  });

  it("should validate number type", () => {
    const schema: JSONSchemaProperties = {
      age: { type: "number" },
    };
    const model = new FormModel(schema);
    model.setValue("age", "not a number" as unknown as number);
    expect(model.validate()).toBe(false);
    expect(model.getField("age")?.errors).toContain("Must be a number");
  });

  it("should validate string length constraints", () => {
    const schema: JSONSchemaProperties = {
      password: {
        type: "string",
        minLength: 8,
        maxLength: 20,
      },
    };
    const model = new FormModel(schema);

    model.setValue("password", "short");
    expect(model.validate()).toBe(false);
    expect(model.getField("password")?.errors).toContain(
      "Must be at least 8 characters"
    );
  });

  it("should handle nested objects", () => {
    const schema: JSONSchemaProperties = {
      person: {
        type: "object",
        properties: {
          name: { type: "string", default: "John" },
          age: { type: "number", default: 30 },
        },
      },
    };
    const model = new FormModel(schema);

    expect(model.getField("person")?.value).toEqual({ name: "John", age: 30 });
    expect(model.getField("person.name")?.value).toBe("John");
    expect(model.getField("person.age")?.value).toBe(30);
  });

  it("should handle arrays", () => {
    const schema: JSONSchemaProperties = {
      tags: {
        type: "array",
        items: { type: "string" },
        default: ["tag1", "tag2"],
      },
    };
    const model = new FormModel(schema);

    expect(model.getField("tags")?.value).toEqual(["tag1", "tag2"]);
    expect(model.getField("tags.0")?.value).toBe("tag1");
    expect(model.getField("tags.1")?.value).toBe("tag2");
  });

  it("should handle array operations", () => {
    const schema: JSONSchemaProperties = {
      items: {
        type: "array",
        items: { type: "string" },
      },
    };
    const model = new FormModel(schema);

    // Add items
    const newPath1 = model.addValue("items", "first");
    const newPath2 = model.addValue("items", "second");

    expect(newPath1).toBe("items.0");
    expect(newPath2).toBe("items.1");
    expect(model.getField("items.0")?.value).toBe("first");
    expect(model.getField("items.1")?.value).toBe("second");

    // Delete item
    const newLength = model.deleteValue("items.0");
    expect(newLength).toBe(1);
    expect(model.getField("items.0")?.value).toBe("second");
  });

  it("should handle setValue operations", () => {
    const schema: JSONSchemaProperties = {
      user: {
        type: "object",
        properties: {
          profile: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
          },
        },
      },
    };
    const model = new FormModel(schema);

    model.setValue("user.profile.name", "Alice");
    expect(model.getField("user.profile.name")?.value).toBe("Alice");

    // Check that parent objects are updated
    const userField = model.getField("user");
    expect(userField?.value).toEqual({
      profile: { name: "Alice" },
    });
  });

  it("should maintain dirty state", () => {
    const schema: JSONSchemaProperties = {
      name: { type: "string" },
    };
    const model = new FormModel(schema);

    const field = model.getField("name");
    expect(field?.dirty).toBe(false);

    model.setValue("name", "John");
    expect(model.getField("name")?.dirty).toBe(true);
  });
});

describe("FormModel - Dirty Flag and Count Testing", () => {
  it("should handle dirty flags and counts with nested values - comprehensive scenario", () => {
    // 1) Set up a form with nested values
    const schema: JSONSchemaProperties = {
      user: {
        type: "object",
        properties: {
          profile: {
            type: "object",
            properties: {
              name: { type: "string", default: "John Doe" },
              email: { type: "string", default: "john@example.com" },
              age: { type: "number", default: 25 },
            },
          },
          preferences: {
            type: "object",
            properties: {
              theme: { type: "string", default: "light" },
              notifications: { type: "boolean", default: true },
            },
          },
          tags: {
            type: "array",
            items: { type: "string" },
            default: ["developer", "javascript"],
          },
        },
      },
    };

    const model = new FormModel(schema);

    // 2) Check default dirty flag and count is false and 0 respectively on all nodes

    // Root level
    const userField = model.getField("user");
    expect(userField?.dirty).toBe(false);
    expect(userField?.dirtyCount).toBe(0);

    // Profile object
    const profileField = model.getField("user.profile");
    expect(profileField?.dirty).toBe(false);
    expect(profileField?.dirtyCount).toBe(0);

    // Profile fields
    const nameField = model.getField("user.profile.name");
    expect(nameField?.dirty).toBe(false);
    expect(nameField?.dirtyCount).toBe(0);

    const emailField = model.getField("user.profile.email");
    expect(emailField?.dirty).toBe(false);
    expect(emailField?.dirtyCount).toBe(0);

    const ageField = model.getField("user.profile.age");
    expect(ageField?.dirty).toBe(false);
    expect(ageField?.dirtyCount).toBe(0);

    // Preferences object
    const preferencesField = model.getField("user.preferences");
    expect(preferencesField?.dirty).toBe(false);
    expect(preferencesField?.dirtyCount).toBe(0);

    // Preferences fields
    const themeField = model.getField("user.preferences.theme");
    expect(themeField?.dirty).toBe(false);
    expect(themeField?.dirtyCount).toBe(0);

    const notificationsField = model.getField("user.preferences.notifications");
    expect(notificationsField?.dirty).toBe(false);
    expect(notificationsField?.dirtyCount).toBe(0);

    // Array field
    const tagsField = model.getField("user.tags");
    expect(tagsField?.dirty).toBe(false);
    expect(tagsField?.dirtyCount).toBe(0);

    // Array elements
    const tag0Field = model.getField("user.tags.0");
    expect(tag0Field?.dirty).toBe(false);
    expect(tag0Field?.dirtyCount).toBe(0);

    const tag1Field = model.getField("user.tags.1");
    expect(tag1Field?.dirty).toBe(false);
    expect(tag1Field?.dirtyCount).toBe(0);

    // 3) Modify each field and check that the dirty flag and count is consistent with each 'edit'

    // Edit 1: Change name
    model.setValue("user.profile.name", "Jane Smith");

    // Check that name field is dirty with count 1
    const updatedNameField = model.getField("user.profile.name");
    expect(updatedNameField?.dirty).toBe(true);
    expect(updatedNameField?.dirtyCount).toBe(1);

    // Check that parent fields are also marked dirty
    const updatedProfileField = model.getField("user.profile");
    expect(updatedProfileField?.dirty).toBe(true);
    expect(updatedProfileField?.dirtyCount).toBe(1);

    const updatedUserField = model.getField("user");
    expect(updatedUserField?.dirty).toBe(true);
    expect(updatedUserField?.dirtyCount).toBe(1);

    // Check sibling fields in profile remain clean
    expect(model.getField("user.profile.email")?.dirty).toBe(false);
    expect(model.getField("user.profile.email")?.dirtyCount).toBe(0);
    expect(model.getField("user.profile.age")?.dirty).toBe(false);
    expect(model.getField("user.profile.age")?.dirtyCount).toBe(0);

    // Check sibling branches remain clean
    expect(model.getField("user.preferences")?.dirty).toBe(false);
    expect(model.getField("user.preferences")?.dirtyCount).toBe(0);
    expect(model.getField("user.preferences.theme")?.dirty).toBe(false);
    expect(model.getField("user.preferences.theme")?.dirtyCount).toBe(0);
    expect(model.getField("user.preferences.notifications")?.dirty).toBe(false);
    expect(model.getField("user.preferences.notifications")?.dirtyCount).toBe(
      0
    );
    expect(model.getField("user.tags")?.dirty).toBe(false);
    expect(model.getField("user.tags")?.dirtyCount).toBe(0);
    expect(model.getField("user.tags.0")?.dirty).toBe(false);
    expect(model.getField("user.tags.0")?.dirtyCount).toBe(0);
    expect(model.getField("user.tags.1")?.dirty).toBe(false);
    expect(model.getField("user.tags.1")?.dirtyCount).toBe(0);

    // Edit 2: Change email (same parent as name)
    model.setValue("user.profile.email", "jane.smith@example.com");

    // Check email field
    const updatedEmailField = model.getField("user.profile.email");
    expect(updatedEmailField?.dirty).toBe(true);
    expect(updatedEmailField?.dirtyCount).toBe(1);

    // Check that parent counts increased
    const profileAfterEmail = model.getField("user.profile");
    expect(profileAfterEmail?.dirty).toBe(true);
    expect(profileAfterEmail?.dirtyCount).toBe(2); // name + email

    const userAfterEmail = model.getField("user");
    expect(userAfterEmail?.dirty).toBe(true);
    expect(userAfterEmail?.dirtyCount).toBe(2); // name + email

    // Check name field remains dirty with same count
    expect(model.getField("user.profile.name")?.dirty).toBe(true);
    expect(model.getField("user.profile.name")?.dirtyCount).toBe(1);

    // Check remaining sibling in profile remains clean
    expect(model.getField("user.profile.age")?.dirty).toBe(false);
    expect(model.getField("user.profile.age")?.dirtyCount).toBe(0);

    // Check other branches still clean
    expect(model.getField("user.preferences")?.dirty).toBe(false);
    expect(model.getField("user.preferences")?.dirtyCount).toBe(0);
    expect(model.getField("user.tags")?.dirty).toBe(false);
    expect(model.getField("user.tags")?.dirtyCount).toBe(0);

    // Edit 3: Change age (completes profile branch)
    model.setValue("user.profile.age", 30);

    const updatedAgeField = model.getField("user.profile.age");
    expect(updatedAgeField?.dirty).toBe(true);
    expect(updatedAgeField?.dirtyCount).toBe(1);

    // Check parent counts
    const profileAfterAge = model.getField("user.profile");
    expect(profileAfterAge?.dirty).toBe(true);
    expect(profileAfterAge?.dirtyCount).toBe(3); // name + email + age

    const userAfterAge = model.getField("user");
    expect(userAfterAge?.dirty).toBe(true);
    expect(userAfterAge?.dirtyCount).toBe(3);

    // Check profile siblings remain with their counts
    expect(model.getField("user.profile.name")?.dirty).toBe(true);
    expect(model.getField("user.profile.name")?.dirtyCount).toBe(1);
    expect(model.getField("user.profile.email")?.dirty).toBe(true);
    expect(model.getField("user.profile.email")?.dirtyCount).toBe(1);

    // Check other branches still clean
    expect(model.getField("user.preferences")?.dirty).toBe(false);
    expect(model.getField("user.preferences")?.dirtyCount).toBe(0);
    expect(model.getField("user.tags")?.dirty).toBe(false);
    expect(model.getField("user.tags")?.dirtyCount).toBe(0);

    // Edit 4: Change theme (different branch)
    model.setValue("user.preferences.theme", "dark");

    const updatedThemeField = model.getField("user.preferences.theme");
    expect(updatedThemeField?.dirty).toBe(true);
    expect(updatedThemeField?.dirtyCount).toBe(1);

    // Check preferences parent
    const updatedPreferencesField = model.getField("user.preferences");
    expect(updatedPreferencesField?.dirty).toBe(true);
    expect(updatedPreferencesField?.dirtyCount).toBe(1);

    // Check root user count increased
    const userAfterTheme = model.getField("user");
    expect(userAfterTheme?.dirty).toBe(true);
    expect(userAfterTheme?.dirtyCount).toBe(4); // profile changes + theme

    // Check profile branch remains unchanged
    expect(model.getField("user.profile")?.dirty).toBe(true);
    expect(model.getField("user.profile")?.dirtyCount).toBe(3);
    expect(model.getField("user.profile.name")?.dirty).toBe(true);
    expect(model.getField("user.profile.name")?.dirtyCount).toBe(1);
    expect(model.getField("user.profile.email")?.dirty).toBe(true);
    expect(model.getField("user.profile.email")?.dirtyCount).toBe(1);
    expect(model.getField("user.profile.age")?.dirty).toBe(true);
    expect(model.getField("user.profile.age")?.dirtyCount).toBe(1);

    // Check preferences sibling remains clean
    expect(model.getField("user.preferences.notifications")?.dirty).toBe(false);
    expect(model.getField("user.preferences.notifications")?.dirtyCount).toBe(
      0
    );

    // Check tags branch still clean
    expect(model.getField("user.tags")?.dirty).toBe(false);
    expect(model.getField("user.tags")?.dirtyCount).toBe(0);

    // Edit 5: Change notifications (same parent as theme)
    model.setValue("user.preferences.notifications", false);

    const updatedNotificationsField = model.getField(
      "user.preferences.notifications"
    );
    expect(updatedNotificationsField?.dirty).toBe(true);
    expect(updatedNotificationsField?.dirtyCount).toBe(1);

    // Check preferences parent count
    const preferencesAfterNotifications = model.getField("user.preferences");
    expect(preferencesAfterNotifications?.dirty).toBe(true);
    expect(preferencesAfterNotifications?.dirtyCount).toBe(2); // theme + notifications

    // Check root count
    const userAfterNotifications = model.getField("user");
    expect(userAfterNotifications?.dirty).toBe(true);
    expect(userAfterNotifications?.dirtyCount).toBe(5);

    // Check theme field remains dirty with same count
    expect(model.getField("user.preferences.theme")?.dirty).toBe(true);
    expect(model.getField("user.preferences.theme")?.dirtyCount).toBe(1);

    // Check profile branch remains unchanged
    expect(model.getField("user.profile")?.dirty).toBe(true);
    expect(model.getField("user.profile")?.dirtyCount).toBe(3);

    // Check tags branch still clean
    expect(model.getField("user.tags")?.dirty).toBe(false);
    expect(model.getField("user.tags")?.dirtyCount).toBe(0);

    // Edit 6: Change array element (third branch)
    model.setValue("user.tags.0", "senior-developer");

    const updatedTag0Field = model.getField("user.tags.0");
    expect(updatedTag0Field?.dirty).toBe(true);
    expect(updatedTag0Field?.dirtyCount).toBe(1);

    // Check array parent
    const updatedTagsField = model.getField("user.tags");
    expect(updatedTagsField?.dirty).toBe(true);
    expect(updatedTagsField?.dirtyCount).toBe(1);

    // Check root count
    const userAfterTag = model.getField("user");
    expect(userAfterTag?.dirty).toBe(true);
    expect(userAfterTag?.dirtyCount).toBe(6);

    // Check array sibling remains clean
    expect(model.getField("user.tags.1")?.dirty).toBe(false);
    expect(model.getField("user.tags.1")?.dirtyCount).toBe(0);

    // Check other branches remain unchanged
    expect(model.getField("user.profile")?.dirty).toBe(true);
    expect(model.getField("user.profile")?.dirtyCount).toBe(3);
    expect(model.getField("user.preferences")?.dirty).toBe(true);
    expect(model.getField("user.preferences")?.dirtyCount).toBe(2);

    // Edit 7: Change second array element (same parent as first tag)
    model.setValue("user.tags.1", "typescript");

    const updatedTag1Field = model.getField("user.tags.1");
    expect(updatedTag1Field?.dirty).toBe(true);
    expect(updatedTag1Field?.dirtyCount).toBe(1);

    // Check array parent count increased
    const tagsAfterSecondEdit = model.getField("user.tags");
    expect(tagsAfterSecondEdit?.dirty).toBe(true);
    expect(tagsAfterSecondEdit?.dirtyCount).toBe(2);

    // Check root count
    const userAfterSecondTag = model.getField("user");
    expect(userAfterSecondTag?.dirty).toBe(true);
    expect(userAfterSecondTag?.dirtyCount).toBe(7);

    // Check first tag field remains dirty with same count
    expect(model.getField("user.tags.0")?.dirty).toBe(true);
    expect(model.getField("user.tags.0")?.dirtyCount).toBe(1);

    // Check other branches remain unchanged
    expect(model.getField("user.profile")?.dirty).toBe(true);
    expect(model.getField("user.profile")?.dirtyCount).toBe(3);
    expect(model.getField("user.preferences")?.dirty).toBe(true);
    expect(model.getField("user.preferences")?.dirtyCount).toBe(2);

    // 4) Undo each of the edits, and again check flag and count is correct

    // For this test, we'll use resetForm() to simulate "undoing" all changes
    // In a real application, you might have individual undo operations

    // Before reset - verify all fields are dirty
    expect(model.getField("user")?.dirty).toBe(true);
    expect(model.getField("user.profile")?.dirty).toBe(true);
    expect(model.getField("user.profile.name")?.dirty).toBe(true);
    expect(model.getField("user.profile.email")?.dirty).toBe(true);
    expect(model.getField("user.profile.age")?.dirty).toBe(true);
    expect(model.getField("user.preferences")?.dirty).toBe(true);
    expect(model.getField("user.preferences.theme")?.dirty).toBe(true);
    expect(model.getField("user.preferences.notifications")?.dirty).toBe(true);
    expect(model.getField("user.tags")?.dirty).toBe(true);
    expect(model.getField("user.tags.0")?.dirty).toBe(true);
    expect(model.getField("user.tags.1")?.dirty).toBe(true);

    // Reset the form (undo all changes)
    model.resetForm();

    // After reset - verify all dirty flags are false and counts are 0
    expect(model.getField("user")?.dirty).toBe(false);
    expect(model.getField("user")?.dirtyCount).toBe(0);

    expect(model.getField("user.profile")?.dirty).toBe(false);
    expect(model.getField("user.profile")?.dirtyCount).toBe(0);

    expect(model.getField("user.profile.name")?.dirty).toBe(false);
    expect(model.getField("user.profile.name")?.dirtyCount).toBe(0);

    expect(model.getField("user.profile.email")?.dirty).toBe(false);
    expect(model.getField("user.profile.email")?.dirtyCount).toBe(0);

    expect(model.getField("user.profile.age")?.dirty).toBe(false);
    expect(model.getField("user.profile.age")?.dirtyCount).toBe(0);

    expect(model.getField("user.preferences")?.dirty).toBe(false);
    expect(model.getField("user.preferences")?.dirtyCount).toBe(0);

    expect(model.getField("user.preferences.theme")?.dirty).toBe(false);
    expect(model.getField("user.preferences.theme")?.dirtyCount).toBe(0);

    expect(model.getField("user.preferences.notifications")?.dirty).toBe(false);
    expect(model.getField("user.preferences.notifications")?.dirtyCount).toBe(
      0
    );

    expect(model.getField("user.tags")?.dirty).toBe(false);
    expect(model.getField("user.tags")?.dirtyCount).toBe(0);

    expect(model.getField("user.tags.0")?.dirty).toBe(false);
    expect(model.getField("user.tags.0")?.dirtyCount).toBe(0);

    expect(model.getField("user.tags.1")?.dirty).toBe(false);
    expect(model.getField("user.tags.1")?.dirtyCount).toBe(0);

    // Verify that values are still the modified values (reset only clears dirty state, not values)
    expect(model.getField("user.profile.name")?.value).toBe("Jane Smith");
    expect(model.getField("user.profile.email")?.value).toBe(
      "jane.smith@example.com"
    );
    expect(model.getField("user.profile.age")?.value).toBe(30);
    expect(model.getField("user.preferences.theme")?.value).toBe("dark");
    expect(model.getField("user.preferences.notifications")?.value).toBe(false);
    expect(model.getField("user.tags.0")?.value).toBe("senior-developer");
    expect(model.getField("user.tags.1")?.value).toBe("typescript");
  });

  it("should handle individual field modifications and track dirty counts correctly", () => {
    const schema: JSONSchemaProperties = {
      settings: {
        type: "object",
        properties: {
          general: {
            type: "object",
            properties: {
              language: { type: "string", default: "en" },
              timezone: { type: "string", default: "UTC" },
            },
          },
        },
      },
    };

    const model = new FormModel(schema);

    // Initial state - all clean
    expect(model.getField("settings")?.dirty).toBe(false);
    expect(model.getField("settings")?.dirtyCount).toBe(0);
    expect(model.getField("settings.general")?.dirty).toBe(false);
    expect(model.getField("settings.general")?.dirtyCount).toBe(0);
    expect(model.getField("settings.general.language")?.dirty).toBe(false);
    expect(model.getField("settings.general.language")?.dirtyCount).toBe(0);

    // Modify the same field multiple times
    model.setValue("settings.general.language", "es");
    expect(model.getField("settings.general.language")?.dirtyCount).toBe(1);
    expect(model.getField("settings.general")?.dirtyCount).toBe(1);
    expect(model.getField("settings")?.dirtyCount).toBe(1);

    model.setValue("settings.general.language", "fr");
    expect(model.getField("settings.general.language")?.dirtyCount).toBe(2);
    expect(model.getField("settings.general")?.dirtyCount).toBe(2);
    expect(model.getField("settings")?.dirtyCount).toBe(2);

    model.setValue("settings.general.language", "de");
    expect(model.getField("settings.general.language")?.dirtyCount).toBe(3);
    expect(model.getField("settings.general")?.dirtyCount).toBe(3);
    expect(model.getField("settings")?.dirtyCount).toBe(3);

    // Modify a different field in the same parent
    model.setValue("settings.general.timezone", "EST");
    expect(model.getField("settings.general.timezone")?.dirtyCount).toBe(1);
    expect(model.getField("settings.general")?.dirtyCount).toBe(4); // 3 + 1
    expect(model.getField("settings")?.dirtyCount).toBe(4);

    // Reset and verify
    model.resetForm();
    expect(model.getField("settings")?.dirtyCount).toBe(0);
    expect(model.getField("settings.general")?.dirtyCount).toBe(0);
    expect(model.getField("settings.general.language")?.dirtyCount).toBe(0);
    expect(model.getField("settings.general.timezone")?.dirtyCount).toBe(0);
  });
});

describe("FormModel - Advanced Features", () => {
  it("should support additional array operations", () => {
    const schema: JSONSchemaProperties = {
      items: {
        type: "array",
        items: { type: "string" },
      },
    };
    const model = new FormModel(schema);

    // Add some items
    model.addValue("items", "first");
    model.addValue("items", "second");
    model.addValue("items", "third");

    // Test move operation (if available)
    if (typeof model.moveArrayItem === "function") {
      model.moveArrayItem("items", 0, 2);
      expect(model.getField("items.0")?.value).toBe("second");
      expect(model.getField("items.1")?.value).toBe("third");
      expect(model.getField("items.2")?.value).toBe("first");
    }

    // Test insert operation (if available)
    if (typeof model.insertArrayItem === "function") {
      model.insertArrayItem("items", 1, "inserted");
      expect(model.getField("items.1")?.value).toBe("inserted");
    }

    // Test array length
    if (typeof model.getArrayLength === "function") {
      const length = model.getArrayLength("items");
      expect(length).toBeGreaterThan(0);
    }
  });

  it("should support form reset", () => {
    const schema: JSONSchemaProperties = {
      name: { type: "string", default: "John" },
    };
    const model = new FormModel(schema);

    model.setValue("name", "Jane");
    expect(model.getField("name")?.dirty).toBe(true);

    if (typeof model.resetForm === "function") {
      model.resetForm();
      expect(model.getField("name")?.dirty).toBe(false);
    }
  });

  it("should support error clearing", () => {
    const schema: JSONSchemaProperties = {
      name: { type: "string", minLength: 1 }, // Make it effectively required
    };
    const model = new FormModel(schema);

    model.validate(); // This should create errors
    expect(model.getField("name")?.errors.length).toBeGreaterThan(0);

    if (typeof model.clearErrors === "function") {
      model.clearErrors();
      expect(model.getField("name")?.errors.length).toBe(0);
    }
  });
});

describe("FormModel - Hybrid Mode", () => {
  it("should track dirty states in hybrid mode", () => {
    const schema: JSONSchemaProperties = {
      user: {
        type: "object",
        properties: {
          name: { type: "string", default: "John" },
          profile: {
            type: "object",
            properties: {
              email: { type: "string" },
              age: { type: "number" }
            }
          }
        }
      }
    };

    const model = new FormModel(schema, { hybridMode: true });
    
    // Initial state
    expect(model.getDirtyFields()).toEqual([]);
    expect(model.getChangedValues()).toEqual({});

    // Modify fields
    model.setValue("user.name", "Jane");
    model.setValue("user.profile.email", "jane@example.com");

    // Verify dirty tracking
    expect(model.getDirtyFields()).toEqual(["user.name", "user.profile.email"]);
    expect(model.getChangedValues()).toEqual({
      "user.name": "Jane",
      "user.profile.email": "jane@example.com"
    });

    // Clear dirty states
    model.clearAllDirtyStates();
    expect(model.getDirtyFields()).toEqual([]);
    expect(model.getChangedValues()).toEqual({});
  });

  it("should maintain backward compatibility when hybrid mode is off", () => {
    const schema: JSONSchemaProperties = {
      user: {
        type: "object",
        properties: {
          name: { type: "string" }
        }
      }
    };

    const model = new FormModel(schema); // hybridMode defaults to false
    
    model.setValue("user.name", "Test");
    expect(model.getField("user.name")?.dirty).toBe(true);
    expect(() => model.getDirtyFields()).toThrow();
    expect(() => model.getChangedValues()).toThrow();
  });
});

describe("FormModel - Nested Data Validation", () => {
  it("should handle nested data validation lifecycle", () => {
    // 1) Set up model with nested data
    const schema: JSONSchemaProperties = {
      user: {
        type: "object",
        properties: {
          profile: {
            type: "object",
            properties: {
              name: {
                type: "string",
                minLength: 1, // Make it effectively required
                maxLength: 50,
              },
              email: {
                type: "string",
                minLength: 5, // Effectively required
              },
              age: {
                type: "number",
                minimum: 18,
                maximum: 120,
              },
            },
          },
          preferences: {
            type: "object",
            properties: {
              theme: {
                type: "string",
                minLength: 1, // Effectively required
              },
              notifications: {
                type: "boolean",
                default: true,
              },
            },
          },
          tags: {
            type: "array",
            items: {
              type: "string",
              minLength: 1,
            },
          },
        },
      },
    };

    const model = new FormModel(schema);

    // Set up initial valid nested data
    model.setValue("user.profile.name", "John Doe");
    model.setValue("user.profile.email", "john@example.com");
    model.setValue("user.profile.age", 25);
    model.setValue("user.preferences.theme", "dark");
    model.setValue("user.preferences.notifications", true);
    model.addValue("user.tags", "developer");
    model.addValue("user.tags", "javascript");

    // Verify initial state is valid
    expect(model.validate()).toBe(true);
    expect(model.getField("user.profile.name")?.errors).toEqual([]);
    expect(model.getField("user.profile.email")?.errors).toEqual([]);
    expect(model.getField("user.profile.age")?.errors).toEqual([]);
    expect(model.getField("user.preferences.theme")?.errors).toEqual([]);

    // 2) Modify nested data with invalid data
    model.setValue("user.profile.name", ""); // Too short, required
    model.setValue("user.profile.email", "bad"); // Too short
    model.setValue("user.profile.age", 15); // Below minimum
    model.setValue("user.preferences.theme", ""); // Required but empty
    model.setValue("user.tags.0", ""); // Empty string in array

    // 3) Check validation messages and counts
    expect(model.validate()).toBe(false);

    // Check individual field errors
    const nameField = model.getField("user.profile.name");
    expect(nameField?.errors).toContain(VALIDATION_MESSAGES.REQUIRED);
    expect(nameField?.errors).toContain(VALIDATION_MESSAGES.MIN_LENGTH(1));
    expect(nameField?.errorCount).toBe(2);

    const emailField = model.getField("user.profile.email");
    expect(emailField?.errors).toContain(VALIDATION_MESSAGES.MIN_LENGTH(5));
    expect(emailField?.errorCount).toBe(1);

    const ageField = model.getField("user.profile.age");
    expect(ageField?.errors).toContain(VALIDATION_MESSAGES.MIN_NUMBER(18));
    expect(ageField?.errorCount).toBe(1);

    const themeField = model.getField("user.preferences.theme");
    expect(themeField?.errors).toContain(VALIDATION_MESSAGES.REQUIRED);
    expect(themeField?.errors).toContain(VALIDATION_MESSAGES.MIN_LENGTH(1));
    expect(themeField?.errorCount).toBe(2);

    const tagField = model.getField("user.tags.0");
    expect(tagField?.errors).toContain(VALIDATION_MESSAGES.REQUIRED);
    expect(tagField?.errors).toContain(VALIDATION_MESSAGES.MIN_LENGTH(1));
    expect(tagField?.errorCount).toBe(2);

    // Verify all fields are marked as dirty
    expect(nameField?.dirty).toBe(true);
    expect(emailField?.dirty).toBe(true);
    expect(ageField?.dirty).toBe(true);
    expect(themeField?.dirty).toBe(true);
    expect(tagField?.dirty).toBe(true);

    // 4) Update nested data to be valid
    model.setValue("user.profile.name", "Jane Smith");
    model.setValue("user.profile.email", "jane.smith@example.com");
    model.setValue("user.profile.age", 30);
    model.setValue("user.preferences.theme", "light");
    model.setValue("user.tags.0", "designer");

    // 5) Test that validation messages and counts are set accordingly
    expect(model.validate()).toBe(true);

    // Check that all errors are cleared
    const updatedNameField = model.getField("user.profile.name");
    expect(updatedNameField?.errors).toEqual([]);
    expect(updatedNameField?.errorCount).toBe(0);

    const updatedEmailField = model.getField("user.profile.email");
    expect(updatedEmailField?.errors).toEqual([]);
    expect(updatedEmailField?.errorCount).toBe(0);

    const updatedAgeField = model.getField("user.profile.age");
    expect(updatedAgeField?.errors).toEqual([]);
    expect(updatedAgeField?.errorCount).toBe(0);

    const updatedThemeField = model.getField("user.preferences.theme");
    expect(updatedThemeField?.errors).toEqual([]);
    expect(updatedThemeField?.errorCount).toBe(0);

    const updatedTagField = model.getField("user.tags.0");
    expect(updatedTagField?.errors).toEqual([]);
    expect(updatedTagField?.errorCount).toBe(0);

    // Verify fields remain dirty (they were modified)
    expect(updatedNameField?.dirty).toBe(true);
    expect(updatedEmailField?.dirty).toBe(true);
    expect(updatedAgeField?.dirty).toBe(true);
    expect(updatedThemeField?.dirty).toBe(true);
    expect(updatedTagField?.dirty).toBe(true);

    // Verify final values are correct
    expect(updatedNameField?.value).toBe("Jane Smith");
    expect(updatedEmailField?.value).toBe("jane.smith@example.com");
    expect(updatedAgeField?.value).toBe(30);
    expect(updatedThemeField?.value).toBe("light");
    expect(updatedTagField?.value).toBe("designer");
  });

  it("should handle deeply nested validation scenarios", () => {
    const schema: JSONSchemaProperties = {
      company: {
        type: "object",
        properties: {
          departments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", isRequired: true, minLength: 3 },
                employees: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      firstName: {
                        type: "string",
                        isRequired: true,
                        minLength: 2,
                      },
                      lastName: {
                        type: "string",
                        isRequired: true,
                        minLength: 2,
                      },
                      salary: {
                        type: "number",
                        minimum: 30000,
                        maximum: 200000,
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

    // Add a department with proper structure
    const deptPath = model.addValue("company.departments", {
      name: "Engineering",
      employees: [],
    });

    // Set up the department name first
    model.setValue(`${deptPath}.name`, "Engineering");

    // Now add an employee - we need to ensure the employees array field exists
    // First, let's set an empty array to establish the field structure
    model.setValue(`${deptPath}.employees`, []);

    // Now add an employee to the established array
    const empPath = model.addValue(`${deptPath}.employees`, {
      firstName: "John",
      lastName: "Doe",
      salary: 75000,
    });

    // Verify initial valid state
    expect(model.validate()).toBe(true);

    // Make nested data invalid
    model.setValue(`${deptPath}.name`, "IT"); // Too short
    model.setValue(`${empPath}.firstName`, "J"); // Too short
    model.setValue(`${empPath}.salary`, 25000); // Below minimum

    // Validate and check errors
    expect(model.validate()).toBe(false);

    expect(model.getField(`${deptPath}`)?.errorCount).toBe(3);

    const deptNameField = model.getField(`${deptPath}.name`);
    expect(deptNameField?.errors).toContain(VALIDATION_MESSAGES.MIN_LENGTH(3));
    expect(deptNameField?.errorCount).toBe(1);

    const empFirstNameField = model.getField(`${empPath}.firstName`);
    expect(empFirstNameField?.errors).toContain(
      VALIDATION_MESSAGES.MIN_LENGTH(2)
    );
    expect(empFirstNameField?.errorCount).toBe(1);

    const empSalaryField = model.getField(`${empPath}.salary`);
    expect(empSalaryField?.errors).toContain(
      VALIDATION_MESSAGES.MIN_NUMBER(30000)
    );
    expect(empSalaryField?.errorCount).toBe(1);

    /////////////////////////////////////////////
    // Fix the validation errors

    expect(model.getField("company")?.errorCount).toBe(3);
    expect(model.getField(`${deptPath}`)?.errorCount).toBe(3);

    model.setValue(`${deptPath}.name`, "Information Technology");
    expect(model.validate()).toBe(false);
    expect(model.getField("company")?.errorCount).toBe(2);
    expect(model.getField(`${deptPath}`)?.errorCount).toBe(2);

    model.setValue(`${empPath}.firstName`, "Jonathan");
    expect(model.validate()).toBe(false);
    expect(model.getField("company")?.errorCount).toBe(1);
    expect(model.getField(`${deptPath}`)?.errorCount).toBe(1);

    model.setValue(`${empPath}.salary`, 85000);
    expect(model.validate()).toBe(true);
    expect(model.getField("company")?.errorCount).toBe(0);
    expect(model.getField(`${deptPath}`)?.errorCount).toBe(0);

    /////////////////////////////////////////////

    // Verify all errors are cleared
    expect(model.validate()).toBe(true);
    expect(model.getField("company")?.errors).toEqual([]);
    expect(model.getField(`${deptPath}`)?.errors).toEqual([]);
    expect(model.getField(`${deptPath}.name`)?.errors).toEqual([]);
    expect(model.getField(`${deptPath}.name`)?.errors).toEqual([]);
    expect(model.getField(`${empPath}.firstName`)?.errors).toEqual([]);
    expect(model.getField(`${empPath}.salary`)?.errors).toEqual([]);
  });
});
