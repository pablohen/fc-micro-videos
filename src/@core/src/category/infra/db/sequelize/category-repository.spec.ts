import { Category } from "#category/domain";
import { NotFoundError, UniqueEntityId } from "#seedwork/domain";
import { setupSequelize } from "#seedwork/infra/testing/helpers/db";
import { CategoryModel } from "./category-model";
import { CategorySequelizeRepository } from "./category-repository";

describe("CategoryRepository Tests", () => {
  setupSequelize({ models: [CategoryModel] });
  let repository: CategorySequelizeRepository;

  beforeEach(async () => {
    repository = new CategorySequelizeRepository(CategoryModel);
  });

  test("should insert a new entity", async () => {
    let category = new Category({
      name: "test",
    });

    await repository.insert(category);

    let model = await CategoryModel.findByPk(category.id);
    expect(model.toJSON()).toStrictEqual(category.toJSON());

    category = new Category({
      name: "test",
      description: "desc",
      is_active: false,
    });

    await repository.insert(category);

    model = await CategoryModel.findByPk(category.id);
    expect(model.toJSON()).toStrictEqual(category.toJSON());
  });

  test("should throw an error when entity not found", async () => {
    await expect(repository.findById("id")).rejects.toThrow(
      new NotFoundError("Entity not found using id id")
    );

    await expect(
      repository.findById(
        new UniqueEntityId("faac7590-7c4f-4a78-b80b-13b067a46ec2")
      )
    ).rejects.toThrow(
      new NotFoundError(
        "Entity not found using id faac7590-7c4f-4a78-b80b-13b067a46ec2"
      )
    );
  });

  test("should find a stored entity", async () => {
    const entity = new Category({
      name: "Name",
    });
    await repository.insert(entity);

    let entityFound = await repository.findById(entity.id);
    expect(entity.toJSON()).toStrictEqual(entityFound.toJSON());

    entityFound = await repository.findById(entity.uniqueEntityId);
    expect(entity.toJSON()).toStrictEqual(entityFound.toJSON());
  });

  test("should return all categories", async () => {
    const entity = new Category({
      name: "Name",
    });
    await repository.insert(entity);

    const entities = await repository.findAll();
    expect(entities).toHaveLength(1);
    expect(JSON.stringify(entities)).toBe(JSON.stringify([entity]));
  });

  test("should first", async () => {
    await CategoryModel.factory().create();
    console.log(await CategoryModel.findAll());
  });
});
