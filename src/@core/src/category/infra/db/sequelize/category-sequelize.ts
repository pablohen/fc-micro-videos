import {
  Category,
  CategoryRepository as CategoryRepositoryContract,
} from "#category/domain";
import {
  EntityValidationError,
  NotFoundError,
  SortDirection,
  UniqueEntityId,
} from "#seedwork/domain";
import { LoadEntityError } from "#seedwork/domain/errors/load-entity-error";
import { SequelizeModelFactory } from "#seedwork/infra/sequelize/sequelize-model-factory";
import { literal, Op } from "sequelize";
import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

export namespace CategorySequelize {
  export type CategoryModelProps = {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: Date;
  };

  @Table({ tableName: "categories", timestamps: false })
  export class CategoryModel extends Model<CategoryModelProps> {
    @PrimaryKey
    @Column({ type: DataType.UUID })
    declare id: string;

    @Column({ allowNull: false, type: DataType.STRING(255) })
    declare name: string;

    @Column({ allowNull: true, type: DataType.TEXT })
    declare description: string | null;

    @Column({ allowNull: false, type: DataType.BOOLEAN })
    declare is_active: boolean;

    @Column({ allowNull: false, type: DataType.DATE(3) })
    declare created_at: Date;

    static factory() {
      const chance: Chance.Chance = require("chance")();

      return new SequelizeModelFactory<CategoryModel, CategoryModelProps>(
        CategoryModel,
        () => ({
          id: chance.guid({ version: 4 }),
          name: chance.word(),
          description: chance.paragraph(),
          is_active: true,
          created_at: chance.date(),
        })
      );
    }
  }

  export class CategoryRepository
    implements CategoryRepositoryContract.Repository
  {
    sortableFields: string[] = ["name", "created_at"];
    orderBy = {
      mysql: {
        name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`),
      },
    };

    constructor(private categoryModel: typeof CategoryModel) {}

    async search(
      props: CategoryRepositoryContract.SearchParams
    ): Promise<CategoryRepositoryContract.SearchResult> {
      const offset = (props.page - 1) * props.per_page;
      const limit = props.per_page;

      const { rows: models, count } = await this.categoryModel.findAndCountAll({
        ...(props.filter && {
          where: {
            name: {
              [Op.like]: `%${props.filter}%`,
            },
          },
        }),
        ...(props.sort && this.sortableFields.includes(props.sort)
          ? { order: this.formatSort(props.sort, props.sort_dir) }
          : { order: [["created_at", "DESC"]] }),
        offset,
        limit,
      });

      return new CategoryRepositoryContract.SearchResult({
        items: models.map((model) => CategoryModelMapper.toEntity(model)),
        current_page: props.page,
        per_page: props.per_page,
        sort: props.sort,
        sort_dir: props.sort_dir,
        total: count,
        filter: props.filter,
      });
    }

    private formatSort(sort: string, sort_dir: SortDirection) {
      const dialect = this.categoryModel.sequelize.getDialect();

      if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
        return this.orderBy[dialect][sort](sort_dir);
      }

      return [[sort, sort_dir]];
    }

    async insert(entity: Category): Promise<void> {
      await this.categoryModel.create(entity.toJSON());
    }

    async bulkInsert(entities: Category[]): Promise<void> {
      await this.categoryModel.bulkCreate(
        entities.map((entity) => entity.toJSON())
      );
    }

    async findById(id: string | UniqueEntityId): Promise<Category> {
      const _id = `${id}`;
      const model = await this._get(_id);

      return CategoryModelMapper.toEntity(model);
    }

    async findAll(): Promise<Category[]> {
      const models = await this.categoryModel.findAll();

      return models.map((model) => CategoryModelMapper.toEntity(model));
    }

    async update(entity: Category): Promise<void> {
      await this._get(entity.id);
      await this.categoryModel.update(entity.toJSON(), {
        where: {
          id: entity.id,
        },
      });
    }

    async delete(id: string | UniqueEntityId): Promise<void> {
      const _id = `${id}`;
      await this._get(_id);
      this.categoryModel.destroy({
        where: {
          id: _id,
        },
      });
    }

    private async _get(id: string) {
      return await this.categoryModel.findByPk(id, {
        rejectOnEmpty: new NotFoundError(`Entity not found using id ${id}`),
      });
    }
  }

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
}
