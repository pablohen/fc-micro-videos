import { Category } from "./category";

describe("Category Integration Tests", () => {
  describe("create method", () => {
    test("should throw validation error when name is invalid", () => {
      expect(() => new Category({ name: null })).containsErrorMessages({
        name: [
          "name should not be empty",
          "name must be a string",
          "name must be shorter than or equal to 255 characters",
        ],
      });

      expect(() => new Category({ name: "" })).containsErrorMessages({
        name: ["name should not be empty"],
      });

      expect(() => new Category({ name: 5 as any })).containsErrorMessages({
        name: [
          "name must be a string",
          "name must be shorter than or equal to 255 characters",
        ],
      });

      expect(
        () => new Category({ name: "t".repeat(256) })
      ).containsErrorMessages({
        name: ["name must be shorter than or equal to 255 characters"],
      });
    });

    test("should throw validation error when description is invalid", () => {
      expect(
        () => new Category({ name: "movie", description: 5 as any })
      ).containsErrorMessages({
        description: ["description must be a string"],
      });
    });

    test("should throw validation error when is_active is invalid", () => {
      expect(
        () => new Category({ name: "movie", is_active: 5 as any })
      ).containsErrorMessages({
        is_active: ["is_active must be a boolean value"],
      });
    });

    test("should create a valid category", () => {
      expect.assertions(0);
      new Category({ name: "Movie" });
      new Category({ name: "Movie", description: "description" });
      new Category({ name: "Movie", description: null });
      new Category({
        name: "Movie",
        description: "description",
        is_active: false,
      });
      new Category({
        name: "Movie",
        description: "description",
        is_active: true,
      });
    });
  });

  describe("update method", () => {
    test("should throw validation error when name is invalid", () => {
      const category = new Category({ name: "Movie" });

      expect(() =>
        category.update({ name: null, description: null })
      ).containsErrorMessages({
        name: [
          "name should not be empty",
          "name must be a string",
          "name must be shorter than or equal to 255 characters",
        ],
      });

      expect(() =>
        category.update({ name: "", description: null })
      ).containsErrorMessages({ name: ["name should not be empty"] });
      expect(() =>
        category.update({ name: 5 as any, description: null })
      ).containsErrorMessages({
        name: [
          "name must be a string",
          "name must be shorter than or equal to 255 characters",
        ],
      });

      expect(() =>
        category.update({ name: "t".repeat(256), description: null })
      ).containsErrorMessages({
        name: ["name must be shorter than or equal to 255 characters"],
      });
    });

    test("should throw validation error when description is invalid", () => {
      const category = new Category({ name: "Movie" });

      expect(() =>
        category.update({ name: "Updated Movie", description: 5 as any })
      ).containsErrorMessages({
        description: ["description must be a string"],
      });
    });

    test("should update a valid category", () => {
      expect.assertions(0);
      const category = new Category({ name: "Movie" });

      category.update({ name: "Movie", description: "description" });
      category.update({ name: "Movie", description: null });
    });
  });
});
