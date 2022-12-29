import { CategorySequelize } from "#category/infra/db/sequelize/category-sequelize";
import { NotFoundError } from "#seedwork/domain";
import { setupSequelize } from "#seedwork/infra/testing/helpers/db";
import { CreateCategoryUseCase } from "../../create-category.use-case";
import { GetCategoryUseCase } from "../../get-category.use-case";

const { CategoryModel, CategoryRepository } = CategorySequelize;

describe("GetCategoryUseCase Integration Tests", () => {
  let repository: CategorySequelize.CategoryRepository;
  let createUseCase: CreateCategoryUseCase.UseCase;
  let getByIdUseCase: GetCategoryUseCase.UseCase;

  setupSequelize({
    models: [CategoryModel],
  });

  beforeEach(() => {
    repository = new CategoryRepository(CategoryModel);
    createUseCase = new CreateCategoryUseCase.UseCase(repository);
    getByIdUseCase = new GetCategoryUseCase.UseCase(repository);
  });

  test("should throw an error when entity not found", async () => {
    await expect(() =>
      getByIdUseCase.execute({ id: "fake id" })
    ).rejects.toThrow(new NotFoundError("Entity not found using id fake id"));
  });

  test("should get a previously saved category", async () => {
    const model = await CategoryModel.factory().create();

    const categoryFound = await getByIdUseCase.execute({ id: model.id });
    expect(categoryFound).toStrictEqual(model.toJSON());
  });
});
