import { Category } from "./category";

describe("Category Tests", () => {
  test("should have correct name", () => {
    const categoryName = "Movie";
    const category = new Category(categoryName);

    expect(category.name).toBe(categoryName);
  });
});
