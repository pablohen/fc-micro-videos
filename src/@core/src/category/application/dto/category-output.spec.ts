import { Category } from "../../../category/domain/entities/category";
import { CategoryOutputMapper } from "./category-output";

describe("CategoryOutputMapper Unit Tests", () => {
  test("should convert a Category in output", async () => {
    const createdAt = new Date();

    const entity = new Category({
      name: "name",
      description: "description",
      created_at: createdAt,
      is_active: true,
    });

    const spyToJSON = jest.spyOn(entity, "toJSON");

    const output = CategoryOutputMapper.toOutput(entity);

    expect(spyToJSON).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      created_at: entity.created_at,
      is_active: entity.is_active,
    });
  });
});
