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
    return new SequelizeModelFactory(StubModel, StubModel.mockFactory);
  }
}

describe("SequelizeModelFactory Tests", () => {
  setupSequelize({ models: [StubModel] });

  test("should create", async () => {
    let model = await StubModel.factory().create();
    expect(uuidValidate(model.id)).toBeTruthy();
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
});
