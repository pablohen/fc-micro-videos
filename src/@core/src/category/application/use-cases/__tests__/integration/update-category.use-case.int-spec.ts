import { CategorySequelize } from "#category/infra/db/sequelize/category-sequelize";
import { NotFoundError } from "#seedwork/domain";
import { setupSequelize } from "#seedwork/infra/testing/helpers/db";
import { UpdateCategoryUseCase } from "../../update-category.use-case";

const { CategoryModel, CategoryRepository } = CategorySequelize;

type Arrange = Array<{
  input: UpdateCategoryUseCase.Input;
  expected: UpdateCategoryUseCase.Output;
}>;

describe("UpdateCategoryUseCase Integration Tests", () => {
  let repository: CategorySequelize.CategoryRepository;
  let useCase: UpdateCategoryUseCase.UseCase;

  setupSequelize({
    models: [CategoryModel],
  });

  beforeEach(() => {
    repository = new CategoryRepository(CategoryModel);
    useCase = new UpdateCategoryUseCase.UseCase(repository);
  });

  test("should throw an error when model not found", async () => {
    await expect(() =>
      useCase.execute({ id: "fake id", name: "fake name" })
    ).rejects.toThrow(new NotFoundError("Entity not found using id fake id"));
  });

  test("should update a category", async () => {
    const model = await CategoryModel.factory().create();

    const arrange: Arrange = [
      {
        input: {
          id: model.id,
          name: "categoria",
        },
        expected: {
          id: model.id,
          name: "categoria",
          description: null,
          is_active: model.is_active,
          created_at: model.created_at,
        },
      },
      {
        input: {
          id: model.id,
          name: "categoria",
          description: "some description",
        },
        expected: {
          id: model.id,
          name: "categoria",
          description: "some description",
          is_active: model.is_active,
          created_at: model.created_at,
        },
      },
      {
        input: {
          id: model.id,
          name: "categoria",
          description: null,
          is_active: false,
        },
        expected: {
          id: model.id,
          name: "categoria",
          description: null,
          is_active: false,
          created_at: model.created_at,
        },
      },
    ];

    for (const item of arrange) {
      const output = await useCase.execute(item.input);
      expect(output).toMatchObject(item.expected);
    }
  });
});
