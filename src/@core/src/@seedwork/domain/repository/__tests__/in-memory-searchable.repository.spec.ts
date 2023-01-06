import { Entity } from "../../entity/entity";
import { InMemorySearchableRepository } from "../in-memory.repository";
import { SearchParams, SearchResult } from "../repository-contracts";

interface StubEntityProps {
  name: string;
  price: number;
}

type StubEntityPropsJson = Required<{ id: string } & StubEntityProps>;

class StubEntity extends Entity<StubEntityProps, StubEntityPropsJson> {
  toJSON(): StubEntityPropsJson {
    return {
      id: this.id,
      name: this.props.name,
      price: this.props.price,
    };
  }
}

class StubInMemorySearchableRepository extends InMemorySearchableRepository<StubEntity> {
  sortableFields: string[] = ["name"];

  protected async applyFilter(
    items: StubEntity[],
    filter: string | null
  ): Promise<StubEntity[]> {
    if (!filter) {
      return items;
    }

    return items.filter((item) => {
      return (
        item.props.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.props.price.toString() === filter
      );
    });
  }
}

type SearchArrange = Array<{
  params: SearchParams;
  result: SearchResult<StubEntity, any>;
}>;

describe("SearchableRepository Unit Tests", () => {
  let repository: StubInMemorySearchableRepository;

  beforeEach(() => {
    repository = new StubInMemorySearchableRepository();
  });

  describe("applyFilter method", () => {
    test("should not filter when filter is null", async () => {
      const items = [
        new StubEntity({
          name: "name",
          price: 5,
        }),
      ];

      const spyFilterMethod = jest.spyOn(items, "filter");

      const itemsFiltered = await repository["applyFilter"](items, null);
      expect(itemsFiltered).toStrictEqual(items);
      expect(spyFilterMethod).not.toHaveBeenCalled();
    });

    test("should filter using a param", async () => {
      const items = [
        new StubEntity({
          name: "test",
          price: 5,
        }),
        new StubEntity({
          name: "TEST",
          price: 5,
        }),
        new StubEntity({
          name: "name",
          price: 10,
        }),
      ];

      const spyFilterMethod = jest.spyOn(items, "filter");

      let itemsFiltered = await repository["applyFilter"](items, "TEST");
      expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
      expect(spyFilterMethod).toHaveBeenCalledTimes(1);

      itemsFiltered = await repository["applyFilter"](items, "5");
      expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
      expect(spyFilterMethod).toHaveBeenCalledTimes(2);

      itemsFiltered = await repository["applyFilter"](items, "no-filter");
      expect(itemsFiltered).toHaveLength(0);
      expect(spyFilterMethod).toHaveBeenCalledTimes(3);
    });
  });

  describe("applySort method", () => {
    test("should not sort when sort is null", async () => {
      const items = [
        new StubEntity({
          name: "b",
          price: 5,
        }),
        new StubEntity({
          name: "a",
          price: 5,
        }),
      ];

      let itemsSorted = await repository["applySort"](items, null, null);
      expect(itemsSorted).toStrictEqual(items);

      itemsSorted = await repository["applySort"](items, "price", "asc");
      expect(itemsSorted).toStrictEqual(items);
    });

    test("should sort items", async () => {
      const items = [
        new StubEntity({
          name: "b",
          price: 5,
        }),
        new StubEntity({
          name: "a",
          price: 5,
        }),
        new StubEntity({
          name: "c",
          price: 10,
        }),
      ];

      let itemsSorted = await repository["applySort"](items, "name", "asc");
      expect(itemsSorted).toStrictEqual([items[1], items[0], items[2]]);

      itemsSorted = await repository["applySort"](items, "name", "desc");
      expect(itemsSorted).toStrictEqual([items[2], items[0], items[1]]);
    });
  });

  describe("applyPaginate method", () => {
    test("should paginate items", async () => {
      const items = [
        new StubEntity({
          name: "b",
          price: 5,
        }),
        new StubEntity({
          name: "a",
          price: 5,
        }),
        new StubEntity({
          name: "c",
          price: 10,
        }),
        new StubEntity({
          name: "e",
          price: 10,
        }),
        new StubEntity({
          name: "d",
          price: 200,
        }),
      ];

      let itemsPaginated = await repository["applyPaginate"](items, 1, 2);
      expect(itemsPaginated).toStrictEqual([items[0], items[1]]);

      itemsPaginated = await repository["applyPaginate"](items, 2, 2);
      expect(itemsPaginated).toStrictEqual([items[2], items[3]]);

      itemsPaginated = await repository["applyPaginate"](items, 3, 2);
      expect(itemsPaginated).toStrictEqual([items[4]]);

      itemsPaginated = await repository["applyPaginate"](items, 4, 2);
      expect(itemsPaginated).toStrictEqual([]);
    });
  });

  describe("search method", () => {
    test("should apply only paginate when other params are null", async () => {
      const entity = new StubEntity({
        name: "b",
        price: 5,
      });

      const items = Array(16).fill(entity);
      repository.items = items;

      const res = await repository.search(new SearchParams());
      expect(res).toStrictEqual(
        new SearchResult({
          items: Array(15).fill(entity),
          total: 16,
          current_page: 1,
          per_page: 15,
          sort: null,
          sort_dir: null,
          filter: null,
        })
      );
    });

    test("should apply paginate and filter", async () => {
      const items = [
        new StubEntity({
          name: "test",
          price: 5,
        }),
        new StubEntity({
          name: "a",
          price: 5,
        }),
        new StubEntity({
          name: "TEST",
          price: 10,
        }),
        new StubEntity({
          name: "TeST",
          price: 10,
        }),
      ];
      repository.items = items;

      let res = await repository.search(
        new SearchParams({
          page: 1,
          per_page: 2,
          filter: "TEST",
        })
      );
      expect(res).toStrictEqual(
        new SearchResult({
          items: [items[0], items[2]],
          total: 3,
          current_page: 1,
          per_page: 2,
          sort: null,
          sort_dir: null,
          filter: "TEST",
        })
      );

      res = await repository.search(
        new SearchParams({
          page: 2,
          per_page: 2,
          filter: "TEST",
        })
      );
      expect(res).toStrictEqual(
        new SearchResult({
          items: [items[3]],
          total: 3,
          current_page: 2,
          per_page: 2,
          sort: null,
          sort_dir: null,
          filter: "TEST",
        })
      );
    });

    describe("should apply paginate and sort", () => {
      const items = [
        new StubEntity({ name: "b", price: 5 }),
        new StubEntity({ name: "a", price: 5 }),
        new StubEntity({ name: "d", price: 10 }),
        new StubEntity({ name: "e", price: 10 }),
        new StubEntity({ name: "c", price: 10 }),
      ];

      beforeEach(() => {
        repository.items = items;
      });

      const arrange: SearchArrange = [
        {
          params: new SearchParams({
            page: 1,
            per_page: 2,
            sort: "name",
          }),
          result: new SearchResult({
            items: [items[1], items[0]],
            total: 5,
            current_page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: null,
          }),
        },
        {
          params: new SearchParams({
            page: 2,
            per_page: 2,
            sort: "name",
          }),
          result: new SearchResult({
            items: [items[4], items[2]],
            total: 5,
            current_page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: null,
          }),
        },
        {
          params: new SearchParams({
            page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
          }),
          result: new SearchResult({
            items: [items[3], items[2]],
            total: 5,
            current_page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
            filter: null,
          }),
        },
        {
          params: new SearchParams({
            page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
          }),
          result: new SearchResult({
            items: [items[4], items[0]],
            total: 5,
            current_page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
            filter: null,
          }),
        },
      ];

      test.each(arrange)("validate %j", async (item) => {
        const res = await repository.search(item.params);
        expect(res).toStrictEqual(item.result);
      });
    });
  });

  describe("should search using filter, sort and paginate", () => {
    const items = [
      new StubEntity({
        name: "test",
        price: 5,
      }),
      new StubEntity({
        name: "a",
        price: 5,
      }),
      new StubEntity({
        name: "TEST",
        price: 10,
      }),
      new StubEntity({
        name: "e",
        price: 10,
      }),
      new StubEntity({
        name: "Test",
        price: 10,
      }),
    ];

    beforeEach(() => {
      repository.items = items;
    });

    const arrange: SearchArrange = [
      {
        params: new SearchParams({
          page: 1,
          per_page: 2,
          sort: "name",
          filter: "TEST",
        }),
        result: new SearchResult({
          items: [items[2], items[4]],
          total: 3,
          current_page: 1,
          per_page: 2,
          sort: "name",
          sort_dir: "asc",
          filter: "TEST",
        }),
      },
      {
        params: new SearchParams({
          page: 2,
          per_page: 2,
          sort: "name",
          filter: "TEST",
        }),
        result: new SearchResult({
          items: [items[0]],
          total: 3,
          current_page: 2,
          per_page: 2,
          sort: "name",
          sort_dir: "asc",
          filter: "TEST",
        }),
      },
    ];

    test.each(arrange)("validate %j", async (item) => {
      const res = await repository.search(item.params);
      expect(res).toStrictEqual(item.result);
    });
  });
});
