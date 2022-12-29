import { CategorySequelize } from "#category/infra/db/sequelize/category-sequelize";
import { setupSequelize } from "#seedwork/infra/testing/helpers/db";
import { CreateCategoryUseCase } from "../../create-category.use-case";

const { CategoryModel, CategoryRepository } = CategorySequelize;

describe("CreateCategoryUseCase Integration Tests", () => {
  let repository: CategorySequelize.CategoryRepository;
  let useCase: CreateCategoryUseCase.UseCase;

  setupSequelize({
    models: [CategoryModel],
  });

  beforeEach(() => {
    repository = new CategoryRepository(CategoryModel);
    useCase = new CreateCategoryUseCase.UseCase(repository);
  });

  describe("should create a new category", () => {
    const arrange = [
      {
        input: { name: "categoria" },
        output: {
          name: "categoria",
          description: null,
          is_active: true,
        },
      },
      {
        input: { name: "categoria", description: "desc" },
        output: {
          name: "categoria",
          description: "desc",
          is_active: true,
        },
      },
      {
        input: { name: "categoria", description: "desc", is_active: false },
        output: {
          name: "categoria",
          description: "desc",
          is_active: false,
        },
      },
    ];

    test.each(arrange)("validate %j", async (item) => {
      const output = await useCase.execute(item.input);
      const entity = await repository.findById(output.id);
      expect(output.id).toStrictEqual(entity.id);
      expect(output.created_at).toStrictEqual(entity.created_at);
      expect(output).toMatchObject(item.output);
    });
  });
});
