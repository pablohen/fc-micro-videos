import { SearchParams, SearchResult } from "../repository-contracts";

type PageArrange = Array<{ page: any; expected: number }>;
type PerPageArrange = Array<{ per_page: any; expected: number }>;
type SortArrange = Array<{ sort: any; expected: string | null }>;
type SortDirArrange = Array<{
  sort: string;
  sort_dir: any;
  expected: string | null;
}>;
type FilterArrange = Array<{ filter: any; expected: string | null }>;

describe("Search Unit Tests", () => {
  describe("SearchParams Unit Tests", () => {
    describe("should check if page prop is working correctly", () => {
      const params = new SearchParams();
      expect(params.page).toBe(1);

      const arrange: PageArrange = [
        { page: null, expected: 1 },
        { page: undefined, expected: 1 },
        { page: "", expected: 1 },
        { page: "fake", expected: 1 },
        { page: 0, expected: 1 },
        { page: -1, expected: 1 },
        { page: 5.5, expected: 1 },
        { page: true, expected: 1 },
        { page: false, expected: 1 },
        { page: {}, expected: 1 },
        { page: 1, expected: 1 },
        { page: 2, expected: 2 },
      ];

      test.each(arrange)("validate %j", (item) => {
        expect(new SearchParams(item).page).toBe(item.expected);
      });
    });

    describe("should check if per_page prop is working correctly", () => {
      const params = new SearchParams();
      expect(params.per_page).toBe(15);

      const arrange: PerPageArrange = [
        { per_page: null, expected: 15 },
        { per_page: undefined, expected: 15 },
        { per_page: "", expected: 15 },
        { per_page: "fake", expected: 15 },
        { per_page: 0, expected: 15 },
        { per_page: -1, expected: 15 },
        { per_page: 5.5, expected: 15 },
        { per_page: false, expected: 15 },
        { per_page: {}, expected: 15 },
        { per_page: 1, expected: 1 },
        { per_page: 2, expected: 2 },
        { per_page: 10, expected: 10 },
        { per_page: true, expected: 15 },
      ];

      test.each(arrange)("validate %j", (item) => {
        expect(new SearchParams(item).per_page).toBe(item.expected);
      });
    });

    describe("should check if sort prop is working correctly", () => {
      const params = new SearchParams();
      expect(params.sort).toBeNull();

      const arrange: SortArrange = [
        { sort: null, expected: null },
        { sort: undefined, expected: null },
        { sort: "", expected: null },
        { sort: 0, expected: "0" },
        { sort: -1, expected: "-1" },
        { sort: 5.5, expected: "5.5" },
        { sort: true, expected: "true" },
        { sort: false, expected: "false" },
        { sort: {}, expected: "[object Object]" },
        { sort: "field", expected: "field" },
      ];

      test.each(arrange)("validate %j", (item) => {
        expect(new SearchParams(item).sort).toBe(item.expected);
      });
    });

    describe("should check if sort_dir prop is working correctly", () => {
      let params = new SearchParams();
      expect(params.sort_dir).toBeNull();

      params = new SearchParams({ sort: null });
      expect(params.sort_dir).toBeNull();

      params = new SearchParams({ sort: undefined });
      expect(params.sort_dir).toBeNull();

      params = new SearchParams({ sort: "" });
      expect(params.sort_dir).toBeNull();

      const arrange: SortDirArrange = [
        { sort: "field", sort_dir: null, expected: "asc" },
        { sort: "field", sort_dir: undefined, expected: "asc" },
        { sort: "field", sort_dir: "", expected: "asc" },
        { sort: "field", sort_dir: 0, expected: "asc" },
        { sort: "field", sort_dir: -1, expected: "asc" },
        { sort: "field", sort_dir: 5.5, expected: "asc" },
        { sort: "field", sort_dir: true, expected: "asc" },
        { sort: "field", sort_dir: false, expected: "asc" },
        { sort: "field", sort_dir: {}, expected: "asc" },
        { sort: "field", sort_dir: "field", expected: "asc" },
        { sort: "field", sort_dir: "asc", expected: "asc" },
        { sort: "field", sort_dir: "ASC", expected: "asc" },
        { sort: "field", sort_dir: "desc", expected: "desc" },
        { sort: "field", sort_dir: "DESC", expected: "desc" },
      ];

      test.each(arrange)("validate %j", (item) => {
        expect(new SearchParams(item).sort_dir).toBe(item.expected);
      });
    });

    describe("should check if filter prop is working correctly", () => {
      const params = new SearchParams();
      expect(params.filter).toBeNull();

      const arrange: FilterArrange = [
        { filter: null, expected: null },
        { filter: undefined, expected: null },
        { filter: "", expected: null },
        { filter: 0, expected: "0" },
        { filter: -1, expected: "-1" },
        { filter: 5.5, expected: "5.5" },
        { filter: true, expected: "true" },
        { filter: false, expected: "false" },
        { filter: {}, expected: "[object Object]" },
        { filter: "field", expected: "field" },
      ];

      test.each(arrange)("validate %j", (item) => {
        expect(new SearchParams(item).filter).toBe(item.expected);
      });
    });
  });

  describe("SearchResult Unit Tests", () => {
    test("should validate constructor props", () => {
      let result = new SearchResult({
        items: ["asd", "asd"] as any,
        total: 4,
        current_page: 1,
        per_page: 2,
        sort: null,
        sort_dir: null,
        filter: null,
      });
      expect(result.toJSON()).toStrictEqual({
        items: ["asd", "asd"] as any,
        total: 4,
        current_page: 1,
        per_page: 2,
        sort: null,
        sort_dir: null,
        filter: null,
        last_page: 2,
      });

      result = new SearchResult({
        items: ["asd", "asd"] as any,
        total: 4,
        current_page: 1,
        per_page: 2,
        sort: "name",
        sort_dir: "asc",
        filter: "test",
      });
      expect(result.toJSON()).toStrictEqual({
        items: ["asd", "asd"] as any,
        total: 4,
        current_page: 1,
        per_page: 2,
        sort: "name",
        sort_dir: "asc",
        filter: "test",
        last_page: 2,
      });
    });

    test("should set last_page to 1 when per_page field is greater than total field", () => {
      const result = new SearchResult({
        items: [],
        total: 4,
        current_page: 1,
        per_page: 15,
        sort: "name",
        sort_dir: "asc",
        filter: "test",
      });
      expect(result.last_page).toBe(1);
    });

    test("should set last_page correctly when total is not multiple of per page", () => {
      const result = new SearchResult({
        items: [],
        total: 101,
        current_page: 1,
        per_page: 20,
        sort: "name",
        sort_dir: "asc",
        filter: "test",
      });
      expect(result.last_page).toBe(6);
    });
  });
});
