import { CategoryInMemoryRepository } from "../../../infra/repository/category-in-memory.repository";
import { CreateCategoryUseCase } from "../create-category.use-case";
import { GetCategoryUseCase } from "../get-category.use-case";

describe("GetCategoryUseCase Unit Tests", () => {
  let repository: CategoryInMemoryRepository;
  let createUseCase: CreateCategoryUseCase.UseCase;
  let getByIdUseCase: GetCategoryUseCase.UseCase;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    createUseCase = new CreateCategoryUseCase.UseCase(repository);
    getByIdUseCase = new GetCategoryUseCase.UseCase(repository);
  });

  test("should throw an error when entity not found", async () => {
    expect(() => getByIdUseCase.execute({ id: "fake id" })).rejects.toThrow(
      "Entity not found"
    );
  });

  test("should get a previously saved category", async () => {
    const spyFindById = jest.spyOn(repository, "findById");

    const output = await createUseCase.execute({
      name: "categoria",
    });
    const categoryFound = await getByIdUseCase.execute({ id: output.id });
    expect(spyFindById).toBeCalledTimes(1);
    expect(categoryFound).toStrictEqual(output);
  });
});
