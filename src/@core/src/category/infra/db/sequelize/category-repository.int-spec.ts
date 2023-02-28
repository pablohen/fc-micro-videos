import { Category, CategoryRepository } from "#category/domain";
import { NotFoundError, SearchParams, UniqueEntityId } from "#seedwork/domain";
import { setupSequelize } from "#seedwork/infra/testing/helpers/db";
import _chance from "chance";
import { CategorySequelize } from "./category-sequelize";

type SearchArrange = Array<{
  params: SearchParams;
  result: CategoryRepository.SearchResult;
}>;

const chance = _chance();

describe("CategoryRepository Tests", () => {
  setupSequelize({ models: [CategorySequelize.CategoryModel] });
  let repository: CategorySequelize.CategoryRepository;

  beforeEach(async () => {
    repository = new CategorySequelize.CategoryRepository(
      CategorySequelize.CategoryModel
    );
  });

  test("should insert a new entity", async () => {
    let category = new Category({
      name: "test",
    });

    await repository.insert(category);

    let entity = await repository.findById(category.id);
    expect(entity.toJSON()).toStrictEqual(category.toJSON());

    category = new Category({
      name: "test",
      description: "desc",
      is_active: false,
    });

    await repository.insert(category);

    entity = await repository.findById(category.id);
    expect(entity.toJSON()).toStrictEqual(category.toJSON());
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

      await CategorySequelize.CategoryModel.factory()
        .count(16)
        .bulkCreate(() => ({
          id: chance.guid({ version: 4 }),
          name: "name",
          description: null,
          is_active: true,
          created_at: createdAt,
        }));

      const spyToEntity = jest.spyOn(
        CategorySequelize.CategoryModelMapper,
        "toEntity"
      );

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

      await CategorySequelize.CategoryModel.factory()
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

    test("should apply paginate and filter", async () => {
      const defaultProps = {
        description: null,
        is_active: true,
        created_at: new Date(),
      };

      const categoriesProp = [
        { id: chance.guid({ version: 4 }), name: "test", ...defaultProps },
        { id: chance.guid({ version: 4 }), name: "a", ...defaultProps },
        { id: chance.guid({ version: 4 }), name: "TEST", ...defaultProps },
        { id: chance.guid({ version: 4 }), name: "TeSt", ...defaultProps },
      ];

      const categories = await CategorySequelize.CategoryModel.bulkCreate(
        categoriesProp
      );

      let searchOutput = await repository.search(
        new CategoryRepository.SearchParams({
          page: 1,
          per_page: 2,
          filter: "TEST",
        })
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CategoryRepository.SearchResult({
          items: [
            CategorySequelize.CategoryModelMapper.toEntity(categories[0]),
            CategorySequelize.CategoryModelMapper.toEntity(categories[2]),
          ],
          total: 3,
          current_page: 1,
          per_page: 2,
          sort: null,
          sort_dir: null,
          filter: "TEST",
        }).toJSON(true)
      );

      searchOutput = await repository.search(
        new CategoryRepository.SearchParams({
          page: 2,
          per_page: 2,
          filter: "TEST",
        })
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CategoryRepository.SearchResult({
          items: [
            CategorySequelize.CategoryModelMapper.toEntity(categories[3]),
          ],
          total: 3,
          current_page: 2,
          per_page: 2,
          sort: null,
          sort_dir: null,
          filter: "TEST",
        }).toJSON(true)
      );
    });

    test("should validate sortableFields", async () => {
      expect(repository.sortableFields).toStrictEqual(["name", "created_at"]);
    });

    test("should apply paginate and sort", async () => {
      expect(repository.sortableFields).toStrictEqual(["name", "created_at"]);

      const categories = [
        Category.fake().aCategory().withName("b").build(),
        Category.fake().aCategory().withName("a").build(),
        Category.fake().aCategory().withName("d").build(),
        Category.fake().aCategory().withName("e").build(),
        Category.fake().aCategory().withName("c").build(),
      ];

      await repository.bulkInsert(categories);

      const arrange: SearchArrange = [
        {
          params: new CategoryRepository.SearchParams({
            page: 1,
            per_page: 2,
            sort: "name",
          }),
          result: new CategoryRepository.SearchResult({
            items: [categories[1], categories[0]],
            total: 5,
            current_page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: null,
          }),
        },
        {
          params: new CategoryRepository.SearchParams({
            page: 2,
            per_page: 2,
            sort: "name",
          }),
          result: new CategoryRepository.SearchResult({
            items: [categories[4], categories[2]],
            total: 5,
            current_page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: null,
          }),
        },
        {
          params: new CategoryRepository.SearchParams({
            page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
          }),
          result: new CategoryRepository.SearchResult({
            items: [categories[3], categories[2]],
            total: 5,
            current_page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
            filter: null,
          }),
        },
        {
          params: new CategoryRepository.SearchParams({
            page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
          }),
          result: new CategoryRepository.SearchResult({
            items: [categories[4], categories[0]],
            total: 5,
            current_page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
            filter: null,
          }),
        },
      ];

      for (const item of arrange) {
        const searchResult = await repository.search(item.params);
        expect(searchResult.toJSON(true)).toMatchObject(
          item.result.toJSON(true)
        );
      }
    });

    test("should search using filter, sort and paginate", async () => {
      const categories = [
        Category.fake()
          .aCategory()
          .withName("test")
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        Category.fake()
          .aCategory()
          .withName("a")
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        Category.fake()
          .aCategory()
          .withName("TEST")
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        Category.fake()
          .aCategory()
          .withName("e")
          .withCreatedAt(new Date(new Date().getTime() + 2000))
          .build(),
        Category.fake()
          .aCategory()
          .withName("TeSt")
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
      ];

      await repository.bulkInsert(categories);

      const arrange: SearchArrange = [
        {
          params: new SearchParams({
            page: 1,
            per_page: 2,
            sort: "name",
            filter: "TEST",
          }),
          result: new CategoryRepository.SearchResult({
            items: [categories[2], categories[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: "TEST",
          }),
        },
        {
          params: new CategoryRepository.SearchParams({
            page: 2,
            per_page: 2,
            sort: "name",
            filter: "TEST",
          }),
          result: new CategoryRepository.SearchResult({
            items: [categories[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: "TEST",
          }),
        },
      ];

      for (const item of arrange) {
        const searchResult = await repository.search(item.params);
        expect(searchResult.toJSON(true)).toMatchObject(
          item.result.toJSON(true)
        );
      }
    });
  });

  test("should throw an error on update if entity not found", async () => {
    const entity = new Category({ name: "Movie" });
    await expect(repository.update(entity)).rejects.toThrow(
      new NotFoundError(`Entity not found using id ${entity.id}`)
    );
  });

  test("should update an entity", async () => {
    const entity = new Category({ name: "Movie" });
    await repository.insert(entity);

    entity.update("Movie updated", entity.description);
    await repository.update(entity);

    const entityFound = await repository.findById(entity.id);
    expect(entityFound.toJSON()).toStrictEqual(entity.toJSON());
  });

  test("should throw an error on delete if entity not found", async () => {
    await expect(repository.delete("fakeId")).rejects.toThrow(
      new NotFoundError(`Entity not found using id fakeId`)
    );

    await expect(
      repository.delete(
        new UniqueEntityId("6edb894a-42a2-4f85-ab1d-ecedaf293c51")
      )
    ).rejects.toThrow(
      new NotFoundError(
        `Entity not found using id 6edb894a-42a2-4f85-ab1d-ecedaf293c51`
      )
    );
  });

  test("should delete an entity", async () => {
    const entity = new Category({ name: "Movie" });
    await repository.insert(entity);
    await repository.delete(entity.id);

    await expect(repository.findById(entity.id)).rejects.toThrow(
      new NotFoundError(`Entity not found using id ${entity.id}`)
    );
  });
});
