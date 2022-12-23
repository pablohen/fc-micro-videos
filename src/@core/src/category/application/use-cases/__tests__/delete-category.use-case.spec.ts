import { NotFoundError } from "../../../../@seedwork/domain/errors/not-found-error";
import { Category } from "../../../domain/entities/category";
import { CategoryInMemoryRepository } from "../../../infra/repository/category-in-memory.repository";
import {
  DeleteCategoryUseCase,
  Input,
  Output,
} from "../delete-category.use-case";

type Arrange = Array<{ input: Input; expected: Output }>;

describe("DeleteCategoryUseCase Unit Tests", () => {
  let repository: CategoryInMemoryRepository;
  let useCase: DeleteCategoryUseCase;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new DeleteCategoryUseCase(repository);
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
