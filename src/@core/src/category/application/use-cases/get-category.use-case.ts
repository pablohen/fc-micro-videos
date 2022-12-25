import { UseCase as DefaultUseCase } from "../../../@seedwork/application/use-case";
import { CategoryRepository } from "../../domain/repository/category.repository";
import { CategoryOutput, CategoryOutputMapper } from "../dto/category-output";

export namespace GetCategoryUseCase {
  export interface Input {
    id: string;
  }

  type Output = CategoryOutput;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private categoryRepository: CategoryRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const entity = await this.categoryRepository.findById(input.id);

      return CategoryOutputMapper.toOutput(entity);
    }
  }
}
