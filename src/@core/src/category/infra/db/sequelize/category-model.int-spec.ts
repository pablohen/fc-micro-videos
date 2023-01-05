import { setupSequelize } from "#seedwork/infra/testing/helpers/db";
import { DataType } from "sequelize-typescript";
import { CategorySequelize } from "./category-sequelize";

describe("CategoryModel Tests", () => {
  setupSequelize({ models: [CategorySequelize.CategoryModel] });

  test("should validate props mapping", async () => {
    const attributesMap = CategorySequelize.CategoryModel.getAttributes();
    const attributes = Object.keys(attributesMap);

    expect(attributes).toStrictEqual([
      "id",
      "name",
      "description",
      "is_active",
      "created_at",
    ]);

    const idAttr = attributesMap.id;
    expect(idAttr).toMatchObject({
      field: "id",
      fieldName: "id",
      primaryKey: true,
      type: DataType.UUID(),
    });

    const nameAttr = attributesMap.name;
    expect(nameAttr).toMatchObject({
      field: "name",
      fieldName: "name",
      allowNull: false,
      type: DataType.STRING(255),
    });

    const descriptionAttr = attributesMap.description;
    expect(descriptionAttr).toMatchObject({
      field: "description",
      fieldName: "description",
      allowNull: true,
      type: DataType.TEXT(),
    });

    const isActiveAttr = attributesMap.is_active;
    expect(isActiveAttr).toMatchObject({
      field: "is_active",
      fieldName: "is_active",
      allowNull: false,
      type: DataType.BOOLEAN(),
    });

    const createdAtAttr = attributesMap.created_at;
    expect(createdAtAttr).toMatchObject({
      field: "created_at",
      fieldName: "created_at",
      allowNull: false,
      type: DataType.DATE(3),
    });
  });

  test("should create a new CategoryModel", async () => {
    const arrange = {
      id: "98dea76c-695f-4972-8d51-3049cf211a10",
      name: "test",
      description: "desc",
      is_active: true,
      created_at: new Date(),
    };
    const category = await CategorySequelize.CategoryModel.create(arrange);

    expect(category.toJSON()).toStrictEqual(arrange);
  });
});
