import { describe, it, expect } from "vitest";
import { FormModel } from "../utils/formModel/FormModel";
import type { JSONSchemaProperties } from "../types/schema";

describe("BufferingManager - Form Buffering and Revert Operations", () => {
  it("should track pristine values and detect changes", () => {
    const schema: JSONSchemaProperties = {
      name: { type: "string", default: "John" },
      age: { type: "number", default: 25 },
    };
    const model = new FormModel(schema);

    // Initial state - no changes
    expect(model.hasUnsavedChanges()).toBe(false);
    expect(model.getChangedFields()).toHaveLength(0);
    expect(model.getChangedPaths()).toHaveLength(0);

    // Make changes
    model.setValue("name", "Jane");
    model.setValue("age", 30);

    // Should detect changes
    expect(model.hasUnsavedChanges()).toBe(true);
    expect(model.getChangedFields()).toHaveLength(2);
    expect(model.getChangedPaths()).toEqual(["name", "age"]);

    // Check individual field changes
    const nameField = model.getField("name");
    const ageField = model.getField("age");
    
    expect(nameField?.hasChanges).toBe(true);
    expect(nameField?.pristineValue).toBe("John");
    expect(nameField?.value).toBe("Jane");
    
    expect(ageField?.hasChanges).toBe(true);
    expect(ageField?.pristineValue).toBe(25);
    expect(ageField?.value).toBe(30);
  });

  it("should handle round-trip changes (back to original)", () => {
    const schema: JSONSchemaProperties = {
      name: { type: "string", default: "John" },
    };
    const model = new FormModel(schema);

    // Change value
    model.setValue("name", "Jane");
    const field = model.getField("name");
    expect(field?.dirty).toBe(true);
    expect(field?.hasChanges).toBe(true);

    // Change back to original
    model.setValue("name", "John");
    const fieldAfter = model.getField("name");
    expect(fieldAfter?.dirty).toBe(true); // Still dirty (was touched)
    expect(fieldAfter?.hasChanges).toBe(false); // No changes (back to pristine)
    expect(model.hasUnsavedChanges()).toBe(false);
  });

  it("should revert individual fields", () => {
    const schema: JSONSchemaProperties = {
      name: { type: "string", default: "John" },
      age: { type: "number", default: 25 },
    };
    const model = new FormModel(schema);

    // Make changes
    model.setValue("name", "Jane");
    model.setValue("age", 30);
    expect(model.hasUnsavedChanges()).toBe(true);

    // Revert only name
    const success = model.revertField("name");
    expect(success).toBe(true);

    const nameField = model.getField("name");
    const ageField = model.getField("age");

    expect(nameField?.value).toBe("John"); // Reverted
    expect(nameField?.hasChanges).toBe(false);
    expect(nameField?.dirty).toBe(false);

    expect(ageField?.value).toBe(30); // Still changed
    expect(ageField?.hasChanges).toBe(true);
    expect(ageField?.dirty).toBe(true);

    expect(model.hasUnsavedChanges()).toBe(true); // Still has changes (age)
  });

  it("should revert entire branches", () => {
    const schema: JSONSchemaProperties = {
      user: {
        type: "object",
        properties: {
          profile: {
            type: "object",
            properties: {
              name: { type: "string", default: "John" },
              email: { type: "string", default: "john@example.com" },
            },
          },
          age: { type: "number", default: 25 },
        },
      },
    };
    const model = new FormModel(schema);

    // Make changes to nested fields
    model.setValue("user.profile.name", "Jane");
    model.setValue("user.profile.email", "jane@example.com");
    model.setValue("user.age", 30);

    expect(model.hasUnsavedChanges()).toBe(true);
    expect(model.getChangedFields()).toHaveLength(3);

    // Revert the profile branch
    const success = model.revertBranch("user.profile");
    expect(success).toBe(true);

    // Profile fields should be reverted
    expect(model.getField("user.profile.name")?.value).toBe("John");
    expect(model.getField("user.profile.email")?.value).toBe("john@example.com");
    expect(model.getField("user.profile.name")?.hasChanges).toBe(false);
    expect(model.getField("user.profile.email")?.hasChanges).toBe(false);

    // Age should still be changed
    expect(model.getField("user.age")?.value).toBe(30);
    expect(model.getField("user.age")?.hasChanges).toBe(true);

    expect(model.hasUnsavedChanges()).toBe(true); // Still has changes (age)
  });

  it("should revert all changes", () => {
    const schema: JSONSchemaProperties = {
      name: { type: "string", default: "John" },
      age: { type: "number", default: 25 },
      settings: {
        type: "object",
        properties: {
          theme: { type: "string", default: "light" },
        },
      },
    };
    const model = new FormModel(schema);

    // Make multiple changes
    model.setValue("name", "Jane");
    model.setValue("age", 30);
    model.setValue("settings.theme", "dark");

    expect(model.hasUnsavedChanges()).toBe(true);
    expect(model.getChangedFields()).toHaveLength(3);

    // Revert all
    model.revertAll();

    // All fields should be reverted
    expect(model.getField("name")?.value).toBe("John");
    expect(model.getField("age")?.value).toBe(25);
    expect(model.getField("settings.theme")?.value).toBe("light");

    expect(model.getField("name")?.hasChanges).toBe(false);
    expect(model.getField("age")?.hasChanges).toBe(false);
    expect(model.getField("settings.theme")?.hasChanges).toBe(false);

    expect(model.getField("name")?.dirty).toBe(false);
    expect(model.getField("age")?.dirty).toBe(false);
    expect(model.getField("settings.theme")?.dirty).toBe(false);

    expect(model.hasUnsavedChanges()).toBe(false);
    expect(model.getChangedFields()).toHaveLength(0);
  });

  it("should create and restore snapshots", () => {
    const schema: JSONSchemaProperties = {
      name: { type: "string", default: "John" },
      age: { type: "number", default: 25 },
    };
    const model = new FormModel(schema);

    // Make initial changes
    model.setValue("name", "Jane");
    model.setValue("age", 30);

    // Create snapshot
    const snapshot = model.createSnapshot();
    expect(snapshot.get("name")).toBe("Jane");
    expect(snapshot.get("age")).toBe(30);

    // Make more changes
    model.setValue("name", "Bob");
    model.setValue("age", 35);
    expect(model.getField("name")?.value).toBe("Bob");
    expect(model.getField("age")?.value).toBe(35);

    // Restore from snapshot
    model.restoreFromSnapshot(snapshot);
    expect(model.getField("name")?.value).toBe("Jane");
    expect(model.getField("age")?.value).toBe(30);
  });

  it("should set pristine values (simulate save)", () => {
    const schema: JSONSchemaProperties = {
      name: { type: "string", default: "John" },
      age: { type: "number", default: 25 },
    };
    const model = new FormModel(schema);

    // Make changes
    model.setValue("name", "Jane");
    model.setValue("age", 30);
    expect(model.hasUnsavedChanges()).toBe(true);

    // Simulate save by setting pristine values
    model.setPristineValues();

    // Should no longer have unsaved changes
    expect(model.hasUnsavedChanges()).toBe(false);
    expect(model.getField("name")?.hasChanges).toBe(false);
    expect(model.getField("age")?.hasChanges).toBe(false);
    expect(model.getField("name")?.dirty).toBe(false);
    expect(model.getField("age")?.dirty).toBe(false);

    // Pristine values should be updated
    expect(model.getField("name")?.pristineValue).toBe("Jane");
    expect(model.getField("age")?.pristineValue).toBe(30);
    expect(model.getField("name")?.value).toBe("Jane");
    expect(model.getField("age")?.value).toBe(30);
  });

  it("should provide change statistics", () => {
    const schema: JSONSchemaProperties = {
      name: { type: "string", default: "John" },
      age: { type: "number", default: 25 },
      email: { type: "string", default: "john@example.com" },
    };
    const model = new FormModel(schema);

    // Initial statistics
    let stats = model.getChangeStatistics();
    const totalFields = stats.totalFields; // Get actual count
    expect(stats.changedFields).toBe(0);
    expect(stats.dirtyFields).toBe(0);
    expect(stats.hasUnsavedChanges).toBe(false);

    // Make some changes
    model.setValue("name", "Jane");
    model.setValue("age", 30);
    // email remains unchanged

    stats = model.getChangeStatistics();
    expect(stats.totalFields).toBe(totalFields);
    expect(stats.changedFields).toBe(2);
    expect(stats.dirtyFields).toBe(2);
    expect(stats.hasUnsavedChanges).toBe(true);

    // Revert one field
    model.revertField("name");

    stats = model.getChangeStatistics();
    expect(stats.totalFields).toBe(totalFields);
    expect(stats.changedFields).toBe(1); // Only age
    expect(stats.dirtyFields).toBe(1); // Only age
    expect(stats.hasUnsavedChanges).toBe(true);
  });

  it("should handle array field buffering", () => {
    const schema: JSONSchemaProperties = {
      tags: {
        type: "array",
        items: { type: "string" },
        default: ["tag1", "tag2"],
      },
    };
    const model = new FormModel(schema);

    // Initial state
    expect(model.hasUnsavedChanges()).toBe(false);

    // Modify array element
    model.setValue("tags.0", "modified-tag1");
    expect(model.hasUnsavedChanges()).toBe(true);
    expect(model.getField("tags.0")?.hasChanges).toBe(true);
    expect(model.getField("tags.0")?.pristineValue).toBe("tag1");
    expect(model.getField("tags.0")?.value).toBe("modified-tag1");

    // Revert array element
    model.revertField("tags.0");
    expect(model.getField("tags.0")?.value).toBe("tag1");
    expect(model.getField("tags.0")?.hasChanges).toBe(false);
    expect(model.hasUnsavedChanges()).toBe(false);
  });
});
