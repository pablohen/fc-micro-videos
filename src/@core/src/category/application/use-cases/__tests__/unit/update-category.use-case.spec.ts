import { Category } from "#category/domain";
import { CategoryInMemoryRepository } from "#category/infra";
import { NotFoundError } from "#seedwork/domain";
import { UpdateCategoryUseCase } from "../../update-category.use-case";

type Arrange = Array<{
  input: UpdateCategoryUseCase.Input;
  expected: UpdateCategoryUseCase.Output;
}>;

describe("UpdateCategoryUseCase Unit Tests", () => {
  let repository: CategoryInMemoryRepository;
  let useCase: UpdateCategoryUseCase.UseCase;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new UpdateCategoryUseCase.UseCase(repository);
  });

  test("should throw an error when entity not found", async () => {
    expect(() =>
      useCase.execute({ id: "fake id", name: "fake desc" })
    ).rejects.toThrow(new NotFoundError("Entity not found"));
  });

  test("should update a category", async () => {
    const entity = new Category({
      name: "Movie",
    });

    repository.items = [entity];

    const arrange: Arrange = [
      {
        input: {
          id: entity.id,
          name: "categoria",
        },
        expected: {
          id: entity.id,
          name: "categoria",
          description: entity.description,
          is_active: entity.is_active,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.id,
          name: "categoria",
          description: "some description",
        },
        expected: {
          id: entity.id,
          name: "categoria",
          description: "some description",
          is_active: entity.is_active,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.id,
          name: "categoria",
          description: null,
          is_active: false,
        },
        expected: {
          id: entity.id,
          name: "categoria",
          description: null,
          is_active: false,
          created_at: entity.created_at,
        },
      },
    ];

    for (const item of arrange) {
      const output = await useCase.execute(item.input);
      expect(output).toStrictEqual(item.expected);
    }
  });
});