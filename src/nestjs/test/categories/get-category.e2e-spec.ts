import { Category, CategoryRepository } from '@fc/micro-videos/category/domain';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { startApp } from '../../src/@share/testing/helpers';
import { CategoriesController } from '../../src/categories/categories.controller';
import { CATEGORY_PROVIDERS } from '../../src/categories/category.providers';
import { CategoryFixture } from '../../src/categories/fixtures';

describe('CategoriesController (e2e)', () => {
  const nestApp = startApp();
  const uuid = 'e0839f2e-866c-4569-89fa-b08319688451';

  describe('/categories/:id (GET)', () => {
    describe('should send an error when id is invalid or not found', () => {
      const arrange = [
        {
          id: uuid,
          expected: {
            message: `Entity not found using id ${uuid}`,
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid  is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, expected }) => {
        return request(nestApp.app.getHttpServer())
          .get(`/categories/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    test('should return a category ', async () => {
      const repository = nestApp.app.get<CategoryRepository.Repository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );
      const category = Category.fake().aCategory().build();
      repository.insert(category);

      const res = await request(nestApp.app.getHttpServer())
        .get(`/categories/${category.id}`)
        .expect(200);
      const keyInResponse = CategoryFixture.keysInResponse();
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

      const presenter = CategoriesController.categoryToResponse(
        category.toJSON(),
      );
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual({
        ...serialized,
        created_at: res.body.data.created_at,
      });
    });
  });
});
