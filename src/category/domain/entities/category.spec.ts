import { omit } from "lodash";
import { v4 as uuidV4, validate as uuidValidate } from "uuid";
import { Category, Props } from "./category";

interface CategoryData {
  props: Props;
  id?: string;
}

describe("Category Unit Tests", () => {
  test("should have valid Category data", () => {
    let category = new Category({ name: "Movie" });

    let props = omit(category.props, "created_at");

    expect(props).toStrictEqual({
      name: "Movie",
      description: null,
      is_active: true,
    });

    expect(category.props.created_at).toBeInstanceOf(Date);

    category = new Category({
      name: "Movie",
      description: "some description",
      is_active: false,
    });

    let created_at = new Date();

    expect(category.props).toStrictEqual({
      name: "Movie",
      description: "some description",
      is_active: false,
      created_at,
    });

    category = new Category({
      name: "Movie",
      description: "other description",
    });

    expect(category.props).toMatchObject({
      name: "Movie",
      description: "other description",
    });

    category = new Category({
      name: "Movie",
      is_active: true,
    });

    expect(category.props).toMatchObject({
      name: "Movie",
      is_active: true,
    });

    created_at = new Date();

    category = new Category({
      name: "Movie",
      created_at,
    });

    expect(category.props).toMatchObject({
      name: "Movie",
      created_at,
    });
  });

  test("should have valid id", () => {
    const data: CategoryData[] = [
      {
        props: { name: "Movie" },
      },
      {
        props: { name: "Movie" },
        id: null,
      },
      {
        props: { name: "Movie" },
        id: undefined,
      },
      {
        props: { name: "Movie" },
        id: uuidV4(),
      },
    ];

    data.forEach((item) => {
      let category = new Category(item.props, item.id);
      expect(category.id).not.toBeNull();
      expect(uuidValidate(category.id)).toBeTruthy();
    });
  });
  test("should have valid name", () => {
    const category = new Category({ name: "Movie" });

    expect(category.name).toBe("Movie");
  });
  test("should have valid description", () => {
    let category = new Category({
      name: "Movie",
    });
    expect(category.description).toBe(null);

    category = new Category({
      name: "Movie",
      description: "description",
    });
    expect(category.description).toBe("description");

    category = new Category({
      name: "Movie",
    });

    category["description"] = "other description";
    expect(category.description).toBe("other description");

    category["description"] = undefined;
    expect(category.description).toBeNull();
  });
  test("should have valid is_active", () => {
    let category = new Category({
      name: "Movie",
    });
    expect(category.is_active).toBeTruthy();

    category = new Category({
      name: "Movie",
      is_active: false,
    });
    expect(category.is_active).toBe(false);

    category = new Category({
      name: "Movie",
      is_active: true,
    });
    expect(category.is_active).toBe(true);
  });

  test("should have valid created_at", () => {
    let category = new Category({
      name: "Movie",
    });
    expect(category.created_at).toBeInstanceOf(Date);

    let created_at = new Date();
    category = new Category({
      name: "Movie",
      created_at,
    });
    expect(category.created_at).toBe(created_at);
  });
});
