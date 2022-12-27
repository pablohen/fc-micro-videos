import _chance from "chance";
import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { validate as uuidValidate } from "uuid";
import { setupSequelize } from "../testing/helpers/db";
import { SequelizeModelFactory } from "./sequelize-model-factory";

const chance = _chance();

@Table({ tableName: "stubs" })
class StubModel extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  declare id;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name;

  static mockFactory = jest.fn(() => ({
    id: chance.guid({ version: 4 }),
    name: chance.word(),
  }));

  static factory() {
    return new SequelizeModelFactory<StubModel, { id: string; name: string }>(
      StubModel,
      StubModel.mockFactory
    );
  }
}

describe("SequelizeModelFactory Tests", () => {
  setupSequelize({ models: [StubModel] });

  test("should use create method", async () => {
    let model = await StubModel.factory().create();
    expect(uuidValidate(model.id)).toBeTruthy();
    expect(model.id).not.toBeNull();
    expect(model.name).not.toBeNull();
    expect(StubModel.mockFactory).toHaveBeenCalledTimes(1);

    let modelFound = await StubModel.findByPk(model.id);
    expect(modelFound.id).toBe(model.id);

    model = await StubModel.factory().create({
      id: "2015694d-9e52-46ee-9926-4e53587ab037",
      name: "test",
    });
    expect(model.id).toBe("2015694d-9e52-46ee-9926-4e53587ab037");
    expect(model.name).toBe("test");
    expect(StubModel.mockFactory).toHaveBeenCalledTimes(1);

    modelFound = await StubModel.findByPk(model.id);
    expect(modelFound.id).toBe(model.id);
  });

  test("should use make method", async () => {
    let model = await StubModel.factory().make();
    expect(uuidValidate(model.id)).toBeTruthy();
    expect(model.id).not.toBeNull();
    expect(model.name).not.toBeNull();
    expect(StubModel.mockFactory).toHaveBeenCalledTimes(1);

    model = await StubModel.factory().make({
      id: "2015694d-9e52-46ee-9926-4e53587ab037",
      name: "test",
    });
    expect(model.id).toBe("2015694d-9e52-46ee-9926-4e53587ab037");
    expect(model.name).toBe("test");
    expect(StubModel.mockFactory).toHaveBeenCalledTimes(1);
  });

  test("should use bulkCreate method with default count", async () => {
    let models = await StubModel.factory().bulkCreate();
    expect(models).toHaveLength(1);
    expect(models[0].id).not.toBeNull();
    expect(models[0].name).not.toBeNull();
    expect(StubModel.mockFactory).toHaveBeenCalledTimes(1);

    let modelFound = await StubModel.findByPk(models[0].id);
    expect(modelFound.id).toBe(models[0].id);
    expect(modelFound.name).toBe(models[0].name);

    models = await StubModel.factory().bulkCreate(() => ({
      id: "2015694d-9e52-46ee-9926-4e53587ab037",
      name: "test",
    }));

    expect(models[0].id).toBe("2015694d-9e52-46ee-9926-4e53587ab037");
    expect(models[0].name).toBe("test");
    expect(StubModel.mockFactory).toHaveBeenCalledTimes(1);

    modelFound = await StubModel.findByPk(models[0].id);
    expect(modelFound.id).toBe(models[0].id);
    expect(modelFound.name).toBe(models[0].name);
  });

  test("should use bulkCreate method with count", async () => {
    let models = await StubModel.factory().count(2).bulkCreate();
    expect(models).toHaveLength(2);
    expect(models[0].id).not.toBeNull();
    expect(models[0].name).not.toBeNull();
    expect(models[1].id).not.toBeNull();
    expect(models[1].name).not.toBeNull();
    expect(StubModel.mockFactory).toHaveBeenCalledTimes(2);

    let modelFound0 = await StubModel.findByPk(models[0].id);
    expect(modelFound0.id).toBe(models[0].id);
    expect(modelFound0.name).toBe(models[0].name);

    let modelFound1 = await StubModel.findByPk(models[1].id);
    expect(modelFound1.id).toBe(models[1].id);
    expect(modelFound1.name).toBe(models[1].name);

    models = await StubModel.factory()
      .count(2)
      .bulkCreate(() => ({
        id: chance.guid({ version: 4 }),
        name: "test",
      }));

    expect(models[0].id).not.toBe(models[1].id);
    expect(models[0].name).toBe("test");
    expect(models[1].name).toBe("test");
    expect(StubModel.mockFactory).toHaveBeenCalledTimes(2);
  });

  test("should use bulkMake method with default count", () => {
    let models = StubModel.factory().bulkMake();
    expect(models).toHaveLength(1);
    expect(models[0].id).not.toBeNull();
    expect(models[0].name).not.toBeNull();
    expect(StubModel.mockFactory).toHaveBeenCalledTimes(1);

    models = StubModel.factory().bulkMake(() => ({
      id: "2015694d-9e52-46ee-9926-4e53587ab037",
      name: "test",
    }));

    expect(models[0].id).toBe("2015694d-9e52-46ee-9926-4e53587ab037");
    expect(models[0].name).toBe("test");
    expect(StubModel.mockFactory).toHaveBeenCalledTimes(1);
  });

  test("should use bulkMake method with count", () => {
    let models = StubModel.factory().count(2).bulkMake();
    expect(models).toHaveLength(2);
    expect(models[0].id).not.toBe(models[1].id);
    expect(models[0].id).not.toBeNull();
    expect(models[0].name).not.toBeNull();
    expect(models[1].id).not.toBeNull();
    expect(models[1].name).not.toBeNull();
    expect(StubModel.mockFactory).toHaveBeenCalledTimes(2);

    models = StubModel.factory()
      .count(2)
      .bulkMake(() => ({
        id: chance.guid({ version: 4 }),
        name: "test",
      }));

    expect(models).toHaveLength(2);
    expect(models[0].id).not.toBe(models[1].id);
    expect(models[0].name).toBe("test");
    expect(models[1].name).toBe("test");
    expect(StubModel.mockFactory).toHaveBeenCalledTimes(2);
  });
});
