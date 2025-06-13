import { describe, it, expect } from "vitest";
import { PathBuilder } from "../utils/PathBuilder";

describe("PathBuilder", () => {
  describe("buildPath", () => {
    it("combines prefix and key with dot", () => {
      expect(PathBuilder.buildPath("parent", "child")).toBe("parent.child");
    });

    it("returns key when prefix is empty", () => {
      expect(PathBuilder.buildPath("", "child")).toBe("child");
    });
  });

  describe("getParentPath", () => {
    it("returns parent path for nested path", () => {
      expect(PathBuilder.getParentPath("parent.child")).toBe("parent");
    });

    it("returns null for top-level path", () => {
      expect(PathBuilder.getParentPath("top")).toBeNull();
    });
  });

  describe("getFieldName", () => {
    it("returns last part of path", () => {
      expect(PathBuilder.getFieldName("parent.child")).toBe("child");
    });

    it("returns full path when no dots", () => {
      expect(PathBuilder.getFieldName("top")).toBe("top");
    });
  });

  describe("isChildPath", () => {
    it("returns true for direct child", () => {
      expect(PathBuilder.isChildPath("parent", "parent.child")).toBe(true);
    });

    it("returns false for non-child", () => {
      expect(PathBuilder.isChildPath("parent", "other.child")).toBe(false);
    });

    it("returns false for same path", () => {
      expect(PathBuilder.isChildPath("parent", "parent")).toBe(false);
    });
  });

  describe("getPathParts", () => {
    it("splits path by dots", () => {
      expect(PathBuilder.getPathParts("a.b.c")).toEqual(["a", "b", "c"]);
    });

    it("returns single item array for no dots", () => {
      expect(PathBuilder.getPathParts("single")).toEqual(["single"]);
    });
  });

  describe("getNestedValue", () => {
    const obj = {
      a: {
        b: {
          c: 42
        }
      }
    };

    it("gets nested value", () => {
      expect(PathBuilder.getNestedValue(obj, "a.b.c")).toBe(42);
    });

    it("returns undefined for invalid path", () => {
      expect(PathBuilder.getNestedValue(obj, "a.x")).toBeUndefined();
    });
  });

  describe("setNestedValue", () => {
    interface TestNestedObject {
      a?: {
        b?: {
          c?: number;
        };
      };
      x?: {
        y?: {
          z?: string;
        };
      };
    }

    it("sets nested value", () => {
      const obj: TestNestedObject = {};
      PathBuilder.setNestedValue(obj, "a.b.c", 42);
      expect(obj.a?.b?.c).toBe(42);
    });

    it("creates intermediate objects", () => {
      const obj: TestNestedObject = {};
      PathBuilder.setNestedValue(obj, "x.y.z", "test");
      expect(obj.x?.y?.z).toBe("test");
    });
  });
});
