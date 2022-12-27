import { Category } from "#category/domain";
import { UniqueEntityId } from "#seedwork/domain";
import { CategoryModel } from "./category-model";

export class CategoryModelMapper {
  static toEntity(model: CategoryModel) {
    const { id, ...rest } = model.toJSON();

    return new Category(rest, new UniqueEntityId(id));
  }
}
