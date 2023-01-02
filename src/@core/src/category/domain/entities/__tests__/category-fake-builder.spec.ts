import { UniqueEntityId } from "#seedwork/domain";
import { Chance } from "chance";
import { Category } from "../category";
import { CategoryFakeBuilder } from "../category-fake-builder";

describe("Category.fake() Unit Tests", () => {
  describe("should use name", () => {
    const faker = Category.fake().aCategory();

    test("should be a function", () => {
      expect(typeof faker["_name"] === "function").toBeTruthy();
    });

    test("should call the word method", () => {
      const chance: Chance.Chance = Chance();
      const spyWordMethod = jest.spyOn(chance, "word");

      faker["chance"] = chance;
      faker.build();

      expect(spyWordMethod).toBeCalled();
    });

    test("should use withName", () => {
      faker.withName("test name");
      expect(faker["name"]).toBe("test name");

      faker.withName(() => "test name");
      //@ts-expect-error - I know
      expect(faker["_name"]()).toBe("test name");
    });

    test("should pass index to name factory", () => {
      faker.withName((index) => `test name ${index}`);

      const category = faker.build();
      expect(category.name).toBe("test name 0");

      const fakerMany = Category.fake().theCategories(2);
      fakerMany.withName((index) => `test name ${index}`);

      const categories = fakerMany.build();
      expect(categories[0].name).toBe("test name 0");
      expect(categories[1].name).toBe("test name 1");
    });

    test("should validate invalid empty case", () => {
      faker.withInvalidNameEmpty(undefined);
      expect(faker["name"]).toBeUndefined();

      faker.withInvalidNameEmpty(null);
      expect(faker["name"]).toBeNull();

      faker.withInvalidNameEmpty("");
      expect(faker["name"]).toBe("");
    });

    test("should validate too long", () => {
      faker.withInvalidNameTooLong();
      expect(faker["name"].length).toBe(256);

      const tooLong = "a".repeat(256);
      faker.withInvalidNameTooLong(tooLong);
      expect(faker["name"].length).toBe(256);
      expect(faker["name"]).toBe(tooLong);
    });
  });

  describe("should use description", () => {
    const faker = Category.fake().aCategory();

    test("should be a function", () => {
      expect(typeof faker["_description"] === "function").toBeTruthy();
    });

    test("should call the paragraph method", () => {
      const chance: Chance.Chance = Chance();
      const spyParagraphMethod = jest.spyOn(chance, "paragraph");

      faker["chance"] = chance;
      faker.build();

      expect(spyParagraphMethod).toBeCalled();
    });

    test("should use withDescription", () => {
      faker.withDescription("test description");
      expect(faker["description"]).toBe("test description");

      faker.withDescription(() => "test description");
      //@ts-expect-error - I know
      expect(faker["_description"]()).toBe("test description");
    });

    test("should pass index to description factory", () => {
      faker.withDescription((index) => `test description ${index}`);

      const category = faker.build();
      expect(category.description).toBe("test description 0");

      const fakerMany = Category.fake().theCategories(2);
      fakerMany.withDescription((index) => `test description ${index}`);

      const categories = fakerMany.build();
      expect(categories[0].description).toBe("test description 0");
      expect(categories[1].description).toBe("test description 1");
    });
  });

  describe("should use is_active", () => {
    const faker = Category.fake().aCategory();

    test("should be a function", () => {
      expect(typeof faker["_is_active"] === "function").toBeTruthy();
    });

    test("should activate", () => {
      faker.activate();
      expect(faker["is_active"]).toBeTruthy();
    });

    test("should deactivate", () => {
      faker.deactivate();
      expect(faker["is_active"]).toBeFalsy();
    });
  });

  describe("unique_entity_id prop", () => {
    const faker = Category.fake().aCategory();

    test("should be undefined", () => {
      expect(faker["_unique_entity_id"]).toBeUndefined();
    });

    test("withUniqueEntityId", () => {
      const uniqueEntityId = new UniqueEntityId();
      const builder = faker.withUniqueEntityId(uniqueEntityId);
      expect(builder).toBeInstanceOf(Category.fake());
      expect(faker["unique_entity_id"]).toBe(uniqueEntityId);

      faker.withUniqueEntityId(() => uniqueEntityId);
      expect(faker["unique_entity_id"]).toBe(uniqueEntityId);
    });

    test("should pass index to unique_entity_id factory", () => {
      let mockFactory = jest.fn().mockReturnValue(new UniqueEntityId());
      faker.withUniqueEntityId(mockFactory);
      faker.build();
      expect(mockFactory).toHaveBeenCalledWith(0);

      mockFactory = jest.fn().mockReturnValue(new UniqueEntityId());
      const fakerMany = Category.fake().theCategories(2);
      fakerMany.withUniqueEntityId(mockFactory);
      fakerMany.build();

      expect(mockFactory).toHaveBeenCalledWith(0);
      expect(mockFactory).toHaveBeenCalledWith(1);
    });
  });

  test("should create a category", async () => {
    const faker = CategoryFakeBuilder.aCategory();
    let category = faker.build();

    expect(category.uniqueEntityId).toBeInstanceOf(UniqueEntityId);
    expect(typeof category.name === "string").toBeTruthy();
    expect(typeof category.description === "string").toBeTruthy();
    expect(category.is_active).toBeTruthy();
    expect(category.created_at).toBeInstanceOf(Date);

    const createdAt = new Date();
    const uniqueEntityId = new UniqueEntityId();
    category = faker
      .withUniqueEntityId(uniqueEntityId)
      .withName("name")
      .withDescription("description")
      .deactivate()
      .withCreatedAt(createdAt)
      .build();

    expect(category.uniqueEntityId.value).toBe(uniqueEntityId.value);
    expect(category.name).toBe("name");
    expect(category.description).toBe("description");
    expect(category.is_active).toBeFalsy();
    expect(category.props.created_at).toEqual(createdAt);
  });

  test("should create many categories", async () => {
    const faker = CategoryFakeBuilder.theCategories(2);
    let categories = faker.build();

    categories.forEach((category) => {
      expect(category.uniqueEntityId).toBeInstanceOf(UniqueEntityId);
      expect(typeof category.name === "string").toBeTruthy();
      expect(typeof category.description === "string").toBeTruthy();
      expect(category.is_active).toBeTruthy();
      expect(category.created_at).toBeInstanceOf(Date);
    });

    const createdAt = new Date();
    const uniqueEntityId = new UniqueEntityId();
    categories = faker
      .withUniqueEntityId(uniqueEntityId)
      .withName("name")
      .withDescription("description")
      .deactivate()
      .withCreatedAt(createdAt)
      .build();

    categories.forEach((category) => {
      expect(category.uniqueEntityId.value).toBe(uniqueEntityId.value);
      expect(category.name).toBe("name");
      expect(category.description).toBe("description");
      expect(category.is_active).toBeFalsy();
      expect(category.props.created_at).toEqual(createdAt);
    });
  });
});
