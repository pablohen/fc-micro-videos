import { Category, CategoryRepository } from '@fc/micro-videos/category/domain';
import { getConnectionToken } from '@nestjs/sequelize';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { startApp } from '../../src/@share/testing/helpers';
import { CategoriesController } from '../../src/categories/categories.controller';
import { CATEGORY_PROVIDERS } from '../../src/categories/category.providers';
import { UpdateCategoryFixture } from '../../src/categories/fixtures';

describe('CategoriesController (e2e)', () => {
  const uuid = 'e0839f2e-866c-4569-89fa-b08319688451';

  describe('/categories/:id (PUT)', () => {
    describe('should send an error when id is invalid or not found', () => {
      const nestApp = startApp();
      const faker = Category.fake().aCategory();
      const arrange = [
        {
          id: uuid,
          send_data: { name: faker.name },
          expected: {
            message: `Entity not found using id ${uuid}`,
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          send_data: { name: faker.name },
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid  is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)(
        'when id is $id',
        async ({ id, send_data, expected }) => {
          return request(nestApp.app.getHttpServer())
            .put(`/categories/${id}`)
            .send(send_data)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    describe('should send status code 422 when request body is invalid', () => {
      const app = startApp();
      const invalidRequest = UpdateCategoryFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .put(`/categories/${uuid}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should send status code 422 on EntityValidationError', () => {
      const app = startApp({
        beforeInit: (app) => {
          app['config'].globalPipes = [];
        },
      });

      const validationError =
        UpdateCategoryFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationError).map((key) => ({
        label: key,
        value: validationError[key],
      }));

      let repository: CategoryRepository.Repository;

      beforeEach(() => {
        repository = app.app.get<CategoryRepository.Repository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });

      test.each(arrange)('when body $label', async ({ value }) => {
        const categoryCreated = Category.fake().aCategory().build();
        await repository.insert(categoryCreated);

        return request(app.app.getHttpServer())
          .put(`/categories/${categoryCreated.id}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should update a category', () => {
      const app = startApp();
      const arrange = UpdateCategoryFixture.arrangeForSave();
      let repository: CategoryRepository.Repository;

      beforeEach(async () => {
        const sequelize = app.app.get(getConnectionToken());
        await sequelize.sync({ force: true });
        repository = app.app.get<CategoryRepository.Repository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });

      test.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected }) => {
          const categoryCreated = Category.fake().aCategory().build();
          await repository.insert(categoryCreated);

          const res = await request(app.app.getHttpServer())
            .put(`/categories/${categoryCreated.id}`)
            .send(send_data)
            .expect(200);

          const keysInResponse = UpdateCategoryFixture.keysInResponse();
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

          const categoryUpdated = await repository.findById(res.body.data.id);
          const presenter = CategoriesController.categoryToResponse(
            categoryUpdated.toJSON(),
          );
          const serialized = instanceToPlain(presenter);

          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            created_at: serialized.created_at,
            ...send_data,
            ...expected,
          });
        },
      );
    });
  });
});
