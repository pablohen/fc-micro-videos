import { SortDirection } from "../../domain/repository/repository-contracts";

export interface SearchInputDto<Filter = string> {
  page?: number;
  per_page?: number;
  sort?: string | null;
  sort_dir?: SortDirection | null;
  filter?: Filter | null;
}
