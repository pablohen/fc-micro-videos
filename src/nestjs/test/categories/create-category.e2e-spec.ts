import { CategoryRepository } from '@fc/micro-videos/category/domain';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CategoriesController } from '../../src/categories/categories.controller';
import { CATEGORY_PROVIDERS } from '../../src/categories/category.providers';
import { CategoryFixture } from '../../src/categories/fixtures';
import { applyGlobalConfig } from '../../src/global-config';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let repository: CategoryRepository.Repository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    repository = moduleFixture.get<CategoryRepository.Repository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
    app = moduleFixture.createNestApplication();
    applyGlobalConfig(app);

    await app.init();
  });

  describe('should send status code 422 when request body is invalid', () => {
    const invalidRequest = CategoryFixture.arrangeInvalidRequest();
    const arrange = Object.keys(invalidRequest).map((key) => ({
      label: key,
      value: invalidRequest[key],
    }));

    test.each(arrange)('when body $label', ({ value }) => {
      return request(app.getHttpServer())
        .post('/categories')
        .send(value.send_data)
        .expect(422)
        .expect(value.expected);
    });
  });

  describe('POST /categories', () => {
    const arrange = CategoryFixture.arrangeForSave();

    test('should validate', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .send({})
        .expect(422);
      console.log(res.body);
    });

    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected }) => {
        const res = await request(app.getHttpServer())
          .post('/categories')
          .send(send_data)
          .expect(201);

        const keysInResponse = CategoryFixture.keysInCategoryResponse();
        expect(Object.keys(res.body)).toStrictEqual(['data']);
        expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

        const categoryCreated = await repository.findById(res.body.data.id);
        const presenter = CategoriesController.categoryToResponse(
          categoryCreated.toJSON(),
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
