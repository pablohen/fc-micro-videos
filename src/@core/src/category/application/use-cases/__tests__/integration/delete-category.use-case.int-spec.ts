import { CategorySequelize } from "#category/infra/db/sequelize/category-sequelize";
import { NotFoundError } from "#seedwork/domain";
import { setupSequelize } from "#seedwork/infra/testing/helpers/db";
import { DeleteCategoryUseCase } from "../../delete-category.use-case";

const { CategoryModel, CategoryRepository } = CategorySequelize;

describe("DeleteCategoryUseCase Integration Tests", () => {
  let repository: CategorySequelize.CategoryRepository;
  let useCase: DeleteCategoryUseCase.UseCase;

  setupSequelize({
    models: [CategoryModel],
  });

  beforeEach(() => {
    repository = new CategoryRepository(CategoryModel);
    useCase = new DeleteCategoryUseCase.UseCase(repository);
  });

  test("should throw an error when entity not found", async () => {
    await expect(() => useCase.execute({ id: "fake id" })).rejects.toThrow(
      new NotFoundError("Entity not found using id fake id")
    );
  });

  test("should delete a category", async () => {
    const model = await CategoryModel.factory().create();

    await useCase.execute({ id: model.id });
    const noResModel = await CategoryModel.findByPk(model.id);
    expect(noResModel).toBeNull();
  });
});
