import { UseCase as DefaultUseCase } from "../../../@seedwork/application/use-case";
import { CategoryRepository } from "../../domain/repository/category.repository";

export namespace DeleteCategoryUseCase {
  export interface Input {
    id: string;
  }

  export type Output = void;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private categoryRepository: CategoryRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const entity = await this.categoryRepository.findById(input.id);
      await this.categoryRepository.delete(entity.id);
    }
  }
}
