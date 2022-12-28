import { Category, CategoryRepository } from "#category/domain";
import { NotFoundError, UniqueEntityId } from "#seedwork/domain";
import { setupSequelize } from "#seedwork/infra/testing/helpers/db";
import _chance from "chance";
import { CategoryModelMapper } from "./category-mapper";
import { CategoryModel } from "./category-model";
import { CategorySequelizeRepository } from "./category-repository";

describe("CategoryRepository Tests", () => {
  setupSequelize({ models: [CategoryModel] });
  let chance: Chance.Chance;

  let repository: CategorySequelizeRepository;

  beforeAll(() => {
    chance = _chance();
  });

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

  describe("search method tests", () => {
    test("should only apply paginate when other params are null", async () => {
      const createdAt = new Date();

      await CategoryModel.factory()
        .count(16)
        .bulkCreate(() => ({
          id: chance.guid({ version: 4 }),
          name: "name",
          description: null,
          is_active: true,
          created_at: createdAt,
        }));

      const spyToEntity = jest.spyOn(CategoryModelMapper, "toEntity");

      const searchOutput = await repository.search(
        new CategoryRepository.SearchParams()
      );

      expect(searchOutput).toBeInstanceOf(CategoryRepository.SearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        current_page: 1,
        per_page: 15,
        last_page: 2,
        sort: null,
        sort_dir: null,
        filter: null,
      });

      searchOutput.items.forEach((item) => {
        expect(item).toBeInstanceOf(Category);
        expect(item.id).toBeDefined();
      });

      const items = searchOutput.items.map((item) => item.toJSON());

      expect(items).toMatchObject(
        new Array(15).fill({
          name: "name",
          description: null,
          is_active: true,
          created_at: createdAt,
        })
      );
    });

    test("should order by created_at DESC when search params are null", async () => {
      const createdAt = new Date();

      await CategoryModel.factory()
        .count(16)
        .bulkCreate((index) => ({
          id: chance.guid({ version: 4 }),
          name: `Movie-${index}`,
          description: null,
          is_active: true,
          created_at: new Date(createdAt.getTime() + index * 100),
        }));

      const searchOutput = await repository.search(
        new CategoryRepository.SearchParams()
      );

      const items = searchOutput.items;
      [...items].reverse().forEach((item, index) => {
        expect(item.name).toBe(`Movie-${index + 1}`);
      });
    });
  });
});
