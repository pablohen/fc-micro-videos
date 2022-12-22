import { Category } from "../../../category/domain/entities/category";
import { CategoryRepository } from "../../../category/domain/repository/category.repository";

export interface Input {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface Output {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
}

export class CreateCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository.Repository) {}

  async execute(input: Input): Promise<Output> {
    const entity = new Category(input);
    await this.categoryRepository.insert(entity);

    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      is_active: entity.is_active,
      created_at: entity.created_at,
    };
  }
}
