import { CategoryInMemoryRepository } from "#category/infra";
import { CreateCategoryUseCase } from "../../create-category.use-case";

describe("CreateCategoryUseCase Unit Tests", () => {
  let repository: CategoryInMemoryRepository;
  let useCase: CreateCategoryUseCase.UseCase;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new CreateCategoryUseCase.UseCase(repository);
  });

  test("should create a new category", async () => {
    const spyInsert = jest.spyOn(repository, "insert");

    let output = await useCase.execute({
      name: "categoria",
    });
    expect(spyInsert).toBeCalledTimes(1);
    expect(output).toStrictEqual({
      id: repository.items[0].id,
      name: repository.items[0].name,
      description: repository.items[0].description,
      is_active: repository.items[0].is_active,
      created_at: repository.items[0].created_at,
    });

    output = await useCase.execute({
      name: "categoria 2",
      description: "desc",
      is_active: false,
    });
    expect(spyInsert).toBeCalledTimes(2);
    expect(output).toStrictEqual({
      id: repository.items[1].id,
      name: repository.items[1].name,
      description: repository.items[1].description,
      is_active: repository.items[1].is_active,
      created_at: repository.items[1].created_at,
    });
  });
});
