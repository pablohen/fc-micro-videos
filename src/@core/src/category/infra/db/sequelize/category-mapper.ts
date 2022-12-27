import { Category } from "#category/domain";
import { EntityValidationError, UniqueEntityId } from "#seedwork/domain";
import { LoadEntityError } from "#seedwork/domain/errors/load-entity-error";
import { CategoryModel } from "./category-model";

export class CategoryModelMapper {
  static toEntity(model: CategoryModel) {
    const { id, ...rest } = model.toJSON();

    try {
      return new Category(rest, new UniqueEntityId(id));
    } catch (error) {
      if (error instanceof EntityValidationError) {
        throw new LoadEntityError(error.error);
      }

      throw error;
    }
  }
}
