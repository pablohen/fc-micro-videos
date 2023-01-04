import { EntityValidationError } from '@fc/micro-videos/@seedwork/domain';
import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { EntityValidationErrorFilter } from './entity-validation-error.filter';

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new EntityValidationError({
      field1: ['field1 is required'],
      field2: ['field2 is required'],
    });
  }
}

describe('EntityValidationErrorFilter Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new EntityValidationErrorFilter());

    await app.init();
  });

  test('should catch an EntityValidationError', () => {
    return request(app.getHttpServer())
      .get('/stub')
      .expect(422)
      .expect({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: ['field1 is required', 'field2 is required'],
      });
  });
});
