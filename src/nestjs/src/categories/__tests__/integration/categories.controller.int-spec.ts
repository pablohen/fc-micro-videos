import {
  NotFoundError,
  SortDirection,
} from '@fc/micro-videos/@seedwork/domain';
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
import { CategoryFixture } from '../../../categories/fixtures';
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
    const arrange = [
      {
        request: {
          name: 'Movie',
        },
        expectedPresenter: {
          name: 'Movie',
          description: null,
          is_active: true,
        },
      },
      {
        request: {
          name: 'Movie',
          description: null,
        },
        expectedPresenter: {
          name: 'Movie',
          description: null,
          is_active: true,
        },
      },
      {
        request: {
          name: 'Movie',
          is_active: true,
        },
        expectedPresenter: {
          name: 'Movie',
          description: null,
          is_active: true,
        },
      },
      {
        request: {
          name: 'Movie',
          is_active: false,
        },
        expectedPresenter: {
          name: 'Movie',
          description: null,
          is_active: false,
        },
      },
      {
        request: {
          name: 'Movie',
          description: 'description test',
        },
        expectedPresenter: {
          name: 'Movie',
          description: 'description test',
          is_active: true,
        },
      },
    ];

    test.each(arrange)(
      'validate %j',
      async ({ request, expectedPresenter }) => {
        const presenter = await controller.create(request);

        const entity = await repository.findById(presenter.id);
        expect(presenter.id).toBe(entity.id);
        expect(presenter.name).toBe(expectedPresenter.name);
        expect(presenter.description).toBe(expectedPresenter.description);
        expect(presenter.is_active).toBe(expectedPresenter.is_active);
        expect(presenter.created_at).toStrictEqual(entity.created_at);
      },
    );
  });

  describe('should update a category', () => {
    const category = Category.fake().aCategory().build();

    beforeEach(async () => {
      await repository.insert(category);
    });

    const arrange = CategoryFixture.arrangeForSave();

    test.each(arrange)('validate %j', async ({ send_data, expected }) => {
      const presenter = await controller.update(category.id, send_data);

      const entity = await repository.findById(presenter.id);

      expect(entity.toJSON()).toStrictEqual({
        id: presenter.id,
        created_at: presenter.created_at,
        ...send_data,
        ...expected,
      });
      expect(entity).toMatchObject(new CategoryPresenter(entity));
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
    test('should return categories using empty query with categories ordered by created_at', async () => {
      const categories = Category.fake()
        .theCategories(4)
        .withName((index) => index + '')
        .withCreatedAt((index) => new Date(new Date().getTime() + index))
        .build();

      await repository.bulkInsert(categories);

      const arrange = [
        {
          send_data: {},
          expected: {
            items: [categories[3], categories[2], categories[1], categories[0]],
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 4,
          },
        },
        {
          send_data: { per_page: 2 },
          expected: {
            items: [categories[3], categories[2]],
            current_page: 1,
            last_page: 2,
            per_page: 2,
            total: 4,
          },
        },
        {
          send_data: { page: 2, per_page: 2 },
          expected: {
            items: [categories[1], categories[0]],
            current_page: 2,
            last_page: 2,
            per_page: 2,
            total: 4,
          },
        },
      ];

      for (const item of arrange) {
        const presenter = await controller.search(item.send_data);
        expect(presenter).toEqual(
          new CategoryCollectionPresenter(item.expected),
        );
      }
    });

    test('should returns output using pagination, sort and filter', async () => {
      const faker = Category.fake().aCategory();
      const categories = [
        faker.withName('a').build(),
        faker.withName('AAA').build(),
        faker.withName('AaA').build(),
        faker.withName('b').build(),
        faker.withName('c').build(),
      ];
      await repository.bulkInsert(categories);

      const arrange_asc = [
        {
          send_data: {
            page: 1,
            per_page: 2,
            sort: 'name',
            filter: 'a',
          },
          expected: {
            items: [categories[1], categories[2]],
            current_page: 1,
            last_page: 2,
            per_page: 2,
            total: 3,
          },
        },
        {
          send_data: {
            page: 2,
            per_page: 2,
            sort: 'name',
            filter: 'a',
          },
          expected: {
            items: [categories[0]],
            current_page: 2,
            last_page: 2,
            per_page: 2,
            total: 3,
          },
        },
      ];

      for (const item of arrange_asc) {
        const presenter = await controller.search(item.send_data);
        expect(presenter).toEqual(
          new CategoryCollectionPresenter(item.expected),
        );
      }

      const arrange_desc = [
        {
          send_data: {
            page: 1,
            per_page: 2,
            sort: 'name',
            sort_dir: 'desc' as SortDirection,
            filter: 'a',
          },
          expected: {
            items: [categories[0], categories[2]],
            current_page: 1,
            last_page: 2,
            per_page: 2,
            total: 3,
          },
        },
        {
          send_data: {
            page: 2,
            per_page: 2,
            sort: 'name',
            sort_dir: 'desc' as SortDirection,
            filter: 'a',
          },
          expected: {
            items: [categories[1]],
            current_page: 2,
            last_page: 2,
            per_page: 2,
            total: 3,
          },
        },
      ];

      for (const item of arrange_desc) {
        const presenter = await controller.search(item.send_data);
        expect(presenter).toEqual(
          new CategoryCollectionPresenter(item.expected),
        );
      }
    });
  });
});
