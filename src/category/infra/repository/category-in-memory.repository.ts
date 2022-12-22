import { InMemorySearchableRepository } from "@seedwork/domain/repository/in-memory.repository";
import { SortDirection } from "@seedwork/domain/repository/repository-contracts";
import { Category, CategoryProps } from "category/domain/entities/category";
import { CategoryRepository } from "category/domain/repository/category.repository";

export type CategorySortableFields = keyof CategoryProps;

export class CategoryInMemoryRepository
  extends InMemorySearchableRepository<Category>
  implements CategoryRepository.Repository
{
  sortableFields: CategorySortableFields[] = ["name", "created_at"];

  protected async applyFilter(
    items: Category[],
    filter: CategoryRepository.Filter
  ): Promise<Category[]> {
    if (!filter) {
      return items;
    }

    return items.filter((item) => {
      return item.props.name.toLowerCase().includes(filter.toLowerCase());
    });
  }

  protected async applySort(
    items: Category[],
    sort: string | null,
    sort_dir: SortDirection | null
  ): Promise<Category[]> {
    if (!sort) {
      return super.applySort(items, "created_at", "desc");
    }

    return super.applySort(items, sort, sort_dir);
  }
}
