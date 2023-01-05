import { NotFoundError } from '@fc/micro-videos/@seedwork/domain';
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoryUseCase,
  ListCategoriesUseCase,
  UpdateCategoryUseCase,
} from '@fc/micro-videos/category/application';
import { Category, CategoryRepository } from '@fc/micro-videos/category/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { CATEGORY_PROVIDERS } from '../../../categories/category.providers';
import {
  CategoryFixture,
  ListCategoriesFixture,
  UpdateCategoryFixture,
} from '../../../categories/fixtures';
import {
  CategoryCollectionPresenter,
  CategoryPresenter,
} from '../../../categories/presenter/category.presenter';
import { ConfigModule } from '../../../config/config.module';
import { DatabaseModule } from '../../../database/database.module';
import { CategoriesController } from '../../categories.controller';
import { CategoriesModule } from '../../categories.module';

describe('CategoriesController Integration Tests', () => {
  let controller: CategoriesController;
  let repository: CategoryRepository.Repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule],
    }).compile();

    controller = module.get(CategoriesController);
    repository = module.get(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  test('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createUseCase']).toBeInstanceOf(
      CreateCategoryUseCase.UseCase,
    );
    expect(controller['updateUseCase']).toBeInstanceOf(
      UpdateCategoryUseCase.UseCase,
    );
    expect(controller['listUseCase']).toBeInstanceOf(
      ListCategoriesUseCase.UseCase,
    );
    expect(controller['getUseCase']).toBeInstanceOf(GetCategoryUseCase.UseCase);
    expect(controller['deleteUseCase']).toBeInstanceOf(
      DeleteCategoryUseCase.UseCase,
    );
  });

  describe('should create a category', () => {
    const arrange = CategoryFixture.arrangeForSave();

    test.each(arrange)('when  $send_data', async ({ send_data, expected }) => {
      const presenter = await controller.create(send_data);
      const entity = await repository.findById(presenter.id);

      expect(entity.toJSON()).toStrictEqual({
        id: presenter.id,
        created_at: presenter.created_at,
        ...send_data,
        ...expected,
      });

      expect(presenter).toEqual(new CategoryPresenter(entity));
    });
  });

  describe('should update a category', () => {
    const arrange = UpdateCategoryFixture.arrangeForSave();

    const category = Category.fake().aCategory().build();
    beforeEach(async () => {
      await repository.insert(category);
    });

    test.each(arrange)('when $send_data', async ({ send_data, expected }) => {
      const presenter = await controller.update(category.id, send_data);
      const entity = await repository.findById(presenter.id);

      expect(entity).toMatchObject({
        id: presenter.id,
        created_at: presenter.created_at,
        ...send_data,
        ...expected,
      });
      expect(presenter).toEqual(new CategoryPresenter(entity));
    });
  });

  test('should delete a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    const res = await controller.remove(category.id);

    expect(res).not.toBeDefined();
    await expect(repository.findById(category.id)).rejects.toThrow(
      new NotFoundError(`Entity not found using id ${category.id}`),
    );
  });

  test('should get a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    const presenter = await controller.findOne(category.id);

    expect(presenter.id).toBe(category.id);
    expect(presenter.name).toBe(category.name);
    expect(presenter.description).toBe(category.description);
    expect(presenter.is_active).toBe(category.is_active);
    expect(presenter.created_at).toStrictEqual(category.created_at);
  });

  describe('search method', () => {
    describe('should return categories using empty query with categories ordered by created_at', () => {
      const { entitiesMap, arrange } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when $send_data', async ({ send_data, expected }) => {
        const { entities, meta } = expected;

        const presenter = await controller.search(send_data);

        expect(presenter).toEqual(
          new CategoryCollectionPresenter({
            items: entities,
            ...meta,
          }),
        );
      });
    });

    describe('should returns output using pagination, sort and filter', () => {
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when $send_data', async ({ send_data, expected }) => {
        const { entities, meta } = expected;

        const presenter = await controller.search(send_data);

        expect(presenter).toEqual(
          new CategoryCollectionPresenter({
            items: entities,
            ...meta,
          }),
        );
      });
    });
  });
});
