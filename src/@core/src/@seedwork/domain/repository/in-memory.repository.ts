import { Entity } from "../entity/entity";
import { NotFoundError } from "../errors/not-found-error";
import { UniqueEntityId } from "../value-objects/unique-entity-id.vo";
import {
  RepositoryInterface,
  SearchableRepositoryInterface,
  SearchParams,
  SearchResult,
} from "./repository-contracts";

export abstract class InMemoryRepository<E extends Entity>
  implements RepositoryInterface<E>
{
  items: E[] = [];

  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }

  async findById(id: string | UniqueEntityId): Promise<E> {
    const _id = `${id}`;

    return this._get(_id);
  }

  async findAll(): Promise<E[]> {
    return this.items;
  }

  async update(entity: E): Promise<void> {
    await this._get(entity.id);

    const itemIndex = this.items.findIndex((item) => item.id === entity.id);

    this.items[itemIndex] = entity;
  }

  async delete(id: string | UniqueEntityId): Promise<void> {
    const _id = `${id}`;
    await this._get(_id);

    const itemIndex = this.items.findIndex((item) => item.id === _id);

    this.items.splice(itemIndex, 1);
  }

  protected async _get(id: string): Promise<E> {
    const item = this.items.find((item) => item.id === id);

    if (!item) {
      throw new NotFoundError(`Entity not found using id ${id}`);
    }

    return item;
  }

  bulkInsert(entities: E[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export abstract class InMemorySearchableRepository<
    E extends Entity,
    Filter = string
  >
  extends InMemoryRepository<E>
  implements SearchableRepositoryInterface<E, Filter>
{
  sortableFields: string[];

  async bulkInsert(entities: E[]): Promise<void> {
    this.items.push(...entities);
  }

  async search(props: SearchParams<Filter>): Promise<SearchResult<E, Filter>> {
    const itemsFiltered = await this.applyFilter(this.items, props.filter);
    const itemsSorted = await this.applySort(
      itemsFiltered,
      props.sort,
      props.sort_dir
    );
    const itemsPaginated = await this.applyPaginate(
      itemsSorted,
      props.page,
      props.per_page
    );

    return new SearchResult({
      items: itemsPaginated,
      total: itemsFiltered.length,
      current_page: props.page,
      per_page: props.per_page,
      sort: props.sort,
      sort_dir: props.sort_dir,
      filter: props.filter,
    });
  }

  protected abstract applyFilter(
    items: E[],
    filter: Filter | null
  ): Promise<E[]>;

  protected async applySort(
    items: E[],
    sort: string | null,
    sort_dir: string | null,
    custom_getter?: (sort: string, item: E) => any
  ): Promise<E[]> {
    if (!sort || !this.sortableFields.includes(sort)) {
      return items;
    }

    return [...items].sort((a, b) => {
      const aValue = custom_getter ? custom_getter(sort, a) : a.props[sort];
      const bValue = custom_getter ? custom_getter(sort, b) : b.props[sort];

      if (aValue < bValue) {
        return sort_dir === "asc" ? -1 : 1;
      }

      if (aValue > bValue) {
        return sort_dir === "asc" ? 1 : -1;
      }

      return 0;
    });
  }

  protected async applyPaginate(
    items: E[],
    page: SearchParams["page"],
    per_page: SearchParams["per_page"]
  ): Promise<E[]> {
    const start = (page - 1) * per_page;
    const limit = start + per_page;

    return items.slice(start, limit);
  }
}
