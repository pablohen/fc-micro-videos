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

    let model = await CategorySequelize.CategoryModel.findByPk(category.id);
    expect(model.toJSON()).toStrictEqual(category.toJSON());

    category = new Category({
      name: "test",
      description: "desc",
      is_active: false,
    });

    await repository.insert(category);

    model = await CategorySequelize.CategoryModel.findByPk(category.id);
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
      expect(repository.sortableFields).toStrictEqual(["name", " created_at"]);
    });

    describe("should apply paginate and sort", () => {
      const defaultProps = {
        description: null,
        is_active: true,
        created_at: new Date(),
      };

      const categoriesProps = [
        { id: chance.guid({ version: 4 }), name: "b", ...defaultProps },
        { id: chance.guid({ version: 4 }), name: "a", ...defaultProps },
        { id: chance.guid({ version: 4 }), name: "d", ...defaultProps },
        { id: chance.guid({ version: 4 }), name: "e", ...defaultProps },
        { id: chance.guid({ version: 4 }), name: "c", ...defaultProps },
      ];

      const arrange: SearchArrange = [
        {
          params: new CategoryRepository.SearchParams({
            page: 1,
            per_page: 2,
            sort: "name",
          }),
          result: new CategoryRepository.SearchResult({
            items: [
              new Category(categoriesProps[1]),
              new Category(categoriesProps[0]),
            ],
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
            items: [
              new Category(categoriesProps[4]),
              new Category(categoriesProps[2]),
            ],
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
            items: [
              new Category(categoriesProps[3]),
              new Category(categoriesProps[2]),
            ],
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
            items: [
              new Category(categoriesProps[4]),
              new Category(categoriesProps[0]),
            ],
            total: 5,
            current_page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
            filter: null,
          }),
        },
      ];

      let categories: CategorySequelize.CategoryModel[];

      beforeEach(async () => {
        categories = await CategorySequelize.CategoryModel.bulkCreate(
          categoriesProps
        );
      });

      test.each(arrange)("validate %j", async (item) => {
        const searchResult = await repository.search(item.params);
        expect(searchResult.toJSON(true)).toMatchObject(
          item.result.toJSON(true)
        );
      });
    });

    describe("should search using filter, sort and paginate", () => {
      const defaultProps = {
        description: null,
        is_active: true,
        created_at: new Date(),
      };

      const categoriesProps = [
        { id: chance.guid({ version: 4 }), name: "test", ...defaultProps },
        { id: chance.guid({ version: 4 }), name: "a", ...defaultProps },
        { id: chance.guid({ version: 4 }), name: "TEST", ...defaultProps },
        { id: chance.guid({ version: 4 }), name: "e", ...defaultProps },
        { id: chance.guid({ version: 4 }), name: "TeSt", ...defaultProps },
      ];

      const arrange: SearchArrange = [
        {
          params: new SearchParams({
            page: 1,
            per_page: 2,
            sort: "name",
            filter: "TEST",
          }),
          result: new CategoryRepository.SearchResult({
            items: [
              new Category(categoriesProps[2]),
              new Category(categoriesProps[4]),
            ],
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
            items: [new Category(categoriesProps[0])],
            total: 3,
            current_page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: "TEST",
          }),
        },
      ];

      let categories: CategorySequelize.CategoryModel[];

      beforeEach(async () => {
        categories = await CategorySequelize.CategoryModel.bulkCreate(
          categoriesProps
        );
      });

      test.each(arrange)("validate %j", async (item) => {
        const searchResult = await repository.search(item.params);
        expect(searchResult.toJSON(true)).toMatchObject(
          item.result.toJSON(true)
        );
      });
    });
  });
});
