import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', (done) => {
    request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!')
      .end((err, res) => {
        console.log(err, res.body, res.status);

        if (err) return done(err);
        return done();
      });
  });
});
