import { omit } from "lodash";
import { UniqueEntityId } from "../../../../@seedwork/domain/value-objects/unique-entity-id.vo";
import { Category, CategoryProps } from "../category";

interface CategoryData {
  props: CategoryProps;
  id?: UniqueEntityId;
}

describe("Category Unit Tests", () => {
  beforeEach(() => {
    Category.validate = jest.fn();
  });

  test("should have valid Category data", () => {
    let category = new Category({ name: "Movie" });

    let props = omit(category.props, "created_at");

    expect(Category.validate).toHaveBeenCalled();
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

  describe("should have valid id", () => {
    const arrange: CategoryData[] = [
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
        id: new UniqueEntityId(),
      },
    ];

    test.each(arrange)("when props is %j", (item) => {
      let category = new Category(item.props, item.id);
      expect(category.id).not.toBeNull();
      expect(category.uniqueEntityId).toBeInstanceOf(UniqueEntityId);
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

  test("should update a category", () => {
    let category = new Category({
      name: "Movie",
    });
    expect(Category.validate).toHaveBeenCalledTimes(1);
    expect(category.name).toBe("Movie");

    category.update({ name: "Updated Movie", description: "" });
    expect(Category.validate).toHaveBeenCalledTimes(2);
    expect(category.name).toBe("Updated Movie");

    category.update({
      name: "Updated Movie 2",
      description: "updated description",
    });
    expect(Category.validate).toHaveBeenCalledTimes(3);
    expect(category.name).toBe("Updated Movie 2");
    expect(category.description).toBe("updated description");
  });

  test("should disable and enable a category", () => {
    const category = new Category({
      name: "Movie",
    });
    expect(category.is_active).toBeTruthy();

    category.deactivate();
    expect(category.is_active).toBeFalsy();

    category.activate();
    expect(category.is_active).toBeTruthy();
  });
});
