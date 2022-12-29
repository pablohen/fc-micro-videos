import {
  Category,
  CategoryRepository as CategoryRepositoryContract,
} from "#category/domain";
import { CategorySequelize } from "#category/infra/db/sequelize/category-sequelize";
import { setupSequelize } from "#seedwork/infra/testing/helpers/db";
import _chance from "chance";
import { ListCategoriesUseCase } from "../../list-categories.use-case";

const { CategoryModel, CategoryRepository } = CategorySequelize;

describe("ListCategoriesUseCase Integration Tests", () => {
  let repository: CategorySequelize.CategoryRepository;
  let useCase: ListCategoriesUseCase.UseCase;

  setupSequelize({
    models: [CategoryModel],
  });

  beforeEach(() => {
    repository = new CategoryRepository(CategoryModel);
    useCase = new ListCategoriesUseCase.UseCase(repository);
  });

  test("toOutput method", () => {
    const entity = new Category({
      name: "Movie",
    });

    const result = new CategoryRepositoryContract.SearchResult({
      items: [entity],
      total: 1,
      current_page: 1,
      per_page: 2,
      sort: null,
      sort_dir: null,
      filter: null,
    });

    const output = useCase["toOutput"](result);
    expect(output).toStrictEqual({
      items: [entity.toJSON()],
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });
  });

  test("should return an output using empty input with categories ordered by created_at", async () => {
    const models = await CategoryModel.factory()
      .count(2)
      .bulkCreate((index) => {
        const chance = _chance();

        return {
          id: chance.guid({ version: 4 }),
          name: `category-${index}`,
          description: "some description",
          is_active: true,
          created_at: new Date(new Date().getTime() + index * 1000),
        };
      });

    const output = await useCase.execute({});
    expect(output).toMatchObject({
      items: [...models]
        .reverse()
        .map(CategorySequelize.CategoryModelMapper.toEntity)
        .map((item) => item.toJSON()),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  test("should return an output using pagination, sort and filter", async () => {
    const models = CategoryModel.factory().count(5).bulkMake();
    models[0].name = "a";
    models[1].name = "AAA";
    models[2].name = "AaA";
    models[3].name = "b";
    models[4].name = "c";

    await CategoryModel.bulkCreate(models.map((model) => model.toJSON()));

    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: "name",
      filter: "a",
    });
    expect(output).toMatchObject({
      items: [models[1], models[2]]
        .map(CategorySequelize.CategoryModelMapper.toEntity)
        .map((item) => item.toJSON()),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 2,
      per_page: 2,
      sort: "name",
      filter: "a",
    });
    expect(output).toMatchObject({
      items: [models[0]]
        .map(CategorySequelize.CategoryModelMapper.toEntity)
        .map((item) => item.toJSON()),
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: "name",
      sort_dir: "desc",
      filter: "a",
    });
    expect(output).toMatchObject({
      items: [models[0], models[2]]
        .map(CategorySequelize.CategoryModelMapper.toEntity)
        .map((item) => item.toJSON()),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });
  });
});
