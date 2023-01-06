import { Entity } from "../../entity/entity";
import { NotFoundError } from "../../errors/not-found-error";
import { UniqueEntityId } from "../../value-objects/unique-entity-id.vo";
import { InMemoryRepository } from "../in-memory.repository";

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

class StubInMemoryRepository extends InMemoryRepository<StubEntity> {}

describe("InMemoryRepository Unit Tests", () => {
  let repository: StubInMemoryRepository;

  beforeEach(() => {
    repository = new StubInMemoryRepository();
  });

  test("should insert a new entity", async () => {
    const entity = new StubEntity({
      name: "Name",
      price: 1,
    });

    await repository.insert(entity);
    expect(entity.toJSON()).toStrictEqual(repository.items[0].toJSON());
  });

  test("should throw an error when entity not found", async () => {
    await expect(repository.findById("fakeId")).rejects.toThrow(
      new NotFoundError(`Entity not found using id fakeId`)
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
    const entity = new StubEntity({
      name: "Name",
      price: 1,
    });
    await repository.insert(entity);

    let entityFound = await repository.findById(entity.id);
    expect(entity.toJSON()).toStrictEqual(entityFound.toJSON());

    entityFound = await repository.findById(entity.uniqueEntityId);
    expect(entity.toJSON()).toStrictEqual(entityFound.toJSON());
  });

  test("should return all entities stored", async () => {
    const entity = new StubEntity({
      name: "Name",
      price: 1,
    });

    const entity2 = new StubEntity({
      name: "Name 2",
      price: 2,
    });

    await repository.insert(entity);
    await repository.insert(entity2);
    const entities = await repository.findAll();
    expect(entities.length).toBe(2);
  });

  test("should throw an error on update when entity does not exists", async () => {
    const entity = new StubEntity({
      name: "Name",
      price: 1,
    });

    expect(repository.update(entity)).rejects.toThrow(
      new NotFoundError(`Entity not found using id ${entity.id}`)
    );
  });

  test("should throw an error on delete when entity does not exists", async () => {
    expect(repository.delete("fakeId")).rejects.toThrow(
      new NotFoundError("Entity not found using id fakeId")
    );
    expect(
      repository.delete(
        new UniqueEntityId("faac7590-7c4f-4a78-b80b-13b067a46ec2")
      )
    ).rejects.toThrow(
      new NotFoundError(
        "Entity not found using id faac7590-7c4f-4a78-b80b-13b067a46ec2"
      )
    );
  });

  test("should update an entity", async () => {
    const entity = new StubEntity({
      name: "Name",
      price: 1,
    });

    const updatedEntity = new StubEntity(
      {
        name: "Updated",
        price: 1,
      },
      entity.uniqueEntityId
    );

    await repository.insert(entity);
    await repository.update(updatedEntity);
    expect(updatedEntity.toJSON()).toStrictEqual(repository.items[0].toJSON());
  });

  test("should delete an entity", async () => {
    const entity = new StubEntity({
      name: "Name",
      price: 1,
    });

    await repository.insert(entity);
    await repository.delete(entity.id);
    expect(repository.items).toHaveLength(0);

    await repository.insert(entity);
    await repository.delete(entity.uniqueEntityId);
    expect(repository.items).toHaveLength(0);
  });
});
