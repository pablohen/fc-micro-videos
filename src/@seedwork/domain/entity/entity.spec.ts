import { validate as uuidValidate } from "uuid";
import { UniqueEntityId } from "../value-objects/unique-entity-id.vo";
import { Entity } from "./entity";

interface StubProps {
  prop1: string;
  prop2: number;
}

class StubEntity extends Entity<StubProps> {}

describe("Entity Unit Tests", () => {
  test("should set props and id", () => {
    const arrange = { prop1: "prop 1 value", prop2: 2 };
    const entity = new StubEntity(arrange);

    expect(entity.props).toStrictEqual(arrange);
    expect(entity.uniqueEntityId).toBeInstanceOf(UniqueEntityId);
    expect(uuidValidate(entity.id)).toBeTruthy();
  });

  test("should accept a valid uuid", () => {
    const arrange = { prop1: "prop 1 value", prop2: 2 };
    const uniqueEntityId = new UniqueEntityId();
    const entity = new StubEntity(arrange, uniqueEntityId);

    expect(entity.uniqueEntityId).toBeInstanceOf(UniqueEntityId);
    expect(entity.id).toBe(uniqueEntityId.value);
  });

  test("should convert an entity to JSON", () => {
    const arrange = { prop1: "prop 1 value", prop2: 2 };
    const uniqueEntityId = new UniqueEntityId();
    const entity = new StubEntity(arrange, uniqueEntityId);

    expect(entity.toJSON()).toStrictEqual({
      id: entity.id,
      ...arrange,
    });
  });
});
