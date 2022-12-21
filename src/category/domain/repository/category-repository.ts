import { SearchableRepositoryInterface } from "@seedwork/domain/repository/repository-contracts";
import { Category } from "../entities/category";

export interface CategoryRepository
  extends SearchableRepositoryInterface<Category, any, any> {}
