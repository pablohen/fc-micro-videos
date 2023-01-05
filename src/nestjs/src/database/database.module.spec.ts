import { getConnectionToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import * as Joi from 'joi';
import { Sequelize } from 'sequelize-typescript';
import { ConfigModule, CONFIG_DB_SCHEMA } from '../config/config.module';
import { DatabaseModule } from './database.module';

describe('DatabaseModule Unit Tests', () => {
  describe('sqlite connection', () => {
    const connOptions = {
      DB_VENDOR: 'sqlite',
      DB_HOST: ':memory:',
      DB_LOGGING: false,
      DB_AUTO_LOAD_MODELS: true,
    };

    test('should be valid', () => {
      const schema = Joi.object({
        ...CONFIG_DB_SCHEMA,
      });
      const { error } = schema.validate(connOptions);
      expect(error).toBeUndefined();
    });

    test('should be a sqlite connection', async () => {
      const module = await Test.createTestingModule({
        imports: [
          DatabaseModule,
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            ignoreEnvVars: true,
            validationSchema: null,
            load: [() => connOptions],
          }),
        ],
      }).compile();

      const app = module.createNestApplication();
      const conn = app.get<Sequelize>(getConnectionToken());
      expect(conn).toBeDefined();
      expect(conn.options.dialect).toBe('sqlite');
      expect(conn.options.host).toBe(':memory:');
      await conn.close();
    });
  });

  describe('mysql connection', () => {
    const connOptions = {
      DB_VENDOR: 'mysql',
      DB_HOST: 'db_test',
      DB_DATABASE: 'micro_videos_test',
      DB_USERNAME: 'root',
      DB_PASSWORD: 'root',
      DB_PORT: 3306,
      DB_LOGGING: false,
      DB_AUTO_LOAD_MODELS: true,
    };

    test('should be valid', () => {
      const schema = Joi.object({
        ...CONFIG_DB_SCHEMA,
      });
      const { error } = schema.validate(connOptions);
      expect(error).toBeUndefined();
    });

    //TODO
    // test('should be a mysql connection', async () => {
    //   const module = await Test.createTestingModule({
    //     imports: [
    //       DatabaseModule,
    //       ConfigModule.forRoot({
    //         isGlobal: true,
    //         ignoreEnvFile: true,
    //         ignoreEnvVars: true,
    //         validationSchema: null,
    //         load: [() => connOptions],
    //       }),
    //     ],
    //   }).compile();

    //   const app = module.createNestApplication();
    //   console.log(app.get(ConfigService));
    //   const conn = app.get<Sequelize>(getConnectionToken());
    //   expect(conn).toBeDefined();
    //   expect(conn.options.dialect).toBe('mysql');
    //   expect(conn.options.host).toBe('localhost');
    //   expect(conn.options.database).toBe('micro-videos');
    //   expect(conn.options.username).toBe('root');
    //   expect(conn.options.password).toBe('root');
    //   expect(conn.options.port).toBe(3306);
    //   await conn.close();
    // });
  });
});
