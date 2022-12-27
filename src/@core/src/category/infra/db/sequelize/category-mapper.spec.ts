import { Category } from "#category/domain";
import { UniqueEntityId } from "#seedwork/domain";
import { LoadEntityError } from "#seedwork/domain/errors/load-entity-error";
import { setupSequelize } from "#seedwork/infra/testing/helpers/db";
import { CategoryModelMapper } from "./category-mapper";
import { CategoryModel } from "./category-model";

describe("CategoryModelMapper Tests", () => {
  setupSequelize({ models: [CategoryModel] });

  test("should throw an error when category is invalid", () => {
    const model = CategoryModel.build({
      id: "2015694d-9e52-46ee-9926-4e53587ab037",
    });

    try {
      CategoryModelMapper.toEntity(model);
      fail("The category is valid, but it needs to throw a LoadEntityError");
    } catch (error) {
      expect(error).toBeInstanceOf(LoadEntityError);
      expect(error.error).toMatchObject({
        name: [
          "name should not be empty",
          "name must be a string",
          "name must be shorter than or equal to 255 characters",
        ],
      });
    }
  });

  test("should throw a generic error", () => {
    const error = new Error("Generic Error");
    const spyValidate = jest
      .spyOn(Category, "validate")
      .mockImplementation(() => {
        throw error;
      });

    const model = CategoryModel.build({
      id: "2015694d-9e52-46ee-9926-4e53587ab037",
    });

    expect(() => CategoryModelMapper.toEntity(model)).toThrow(error);
    expect(spyValidate).toHaveBeenCalledTimes(1);
    spyValidate.mockRestore();
  });

  test("should convert model to entity", () => {
    const id = "2015694d-9e52-46ee-9926-4e53587ab037";
    const createdAt = new Date();

    const model = CategoryModel.build({
      id,
      name: "test",
      description: "desc",
      is_active: false,
      created_at: createdAt,
    });

    const entity = CategoryModelMapper.toEntity(model);

    expect(entity.toJSON()).toStrictEqual(
      new Category(
        {
          name: "test",
          description: "desc",
          is_active: false,
          created_at: createdAt,
        },
        new UniqueEntityId(id)
      ).toJSON()
    );
  });
});
