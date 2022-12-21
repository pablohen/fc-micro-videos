import { Entity } from "../entity/entity";
import { NotFoundError } from "../errors/not-found-error";
import { UniqueEntityId } from "../value-objects/unique-entity-id.vo";
import {
  RepositoryInterface,
  SearchableRepositoryInterface,
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
      throw new NotFoundError("Entity not found");
    }

    return item;
  }
}

export abstract class InMemorySearchableRepository<E extends Entity>
  extends InMemoryRepository<E>
  implements SearchableRepositoryInterface<E, any, any>
{
  search(props: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
