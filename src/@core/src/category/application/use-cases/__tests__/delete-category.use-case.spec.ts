import { NotFoundError } from "../../../../@seedwork/domain/errors/not-found-error";
import { Category } from "../../../domain/entities/category";
import { CategoryInMemoryRepository } from "../../../infra/db/in-memory/category-in-memory.repository";
import { DeleteCategoryUseCase } from "../delete-category.use-case";

type Arrange = Array<{
  input: DeleteCategoryUseCase.Input;
  expected: DeleteCategoryUseCase.Output;
}>;

describe("DeleteCategoryUseCase Unit Tests", () => {
  let repository: CategoryInMemoryRepository;
  let useCase: DeleteCategoryUseCase.UseCase;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new DeleteCategoryUseCase.UseCase(repository);
  });

  test("should throw an error when entity not found", async () => {
    expect(() => useCase.execute({ id: "fake id" })).rejects.toThrow(
      new NotFoundError("Entity not found")
    );
  });

  test("should delete a category", async () => {
    const entity = new Category({
      name: "Movie",
    });

    repository.items = [entity];

    await useCase.execute({ id: entity.id });
    expect(repository.items).toHaveLength(0);
  });
});
