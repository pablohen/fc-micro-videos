import { instanceToPlain } from 'class-transformer';
import { CategoryPresenter } from './category.presenter';

describe('CategoryPresenter Unit Tests', () => {
  describe('constructor', () => {
    test('should set values', () => {
      const createdAt = new Date();
      const presenter = new CategoryPresenter({
        id: '01c539f8-7eef-487f-b973-7a4bc97df595',
        name: 'name',
        description: 'description',
        is_active: true,
        created_at: createdAt,
      });

      expect(presenter.id).toBe('01c539f8-7eef-487f-b973-7a4bc97df595');
      expect(presenter.name).toBe('name');
      expect(presenter.description).toBe('description');
      expect(presenter.is_active).toBe(true);
      expect(presenter.created_at).toBe(createdAt);
    });

    test('should present data', () => {
      const createdAt = new Date();
      const presenter = new CategoryPresenter({
        id: '01c539f8-7eef-487f-b973-7a4bc97df595',
        name: 'name',
        description: 'description',
        is_active: true,
        created_at: createdAt,
      });

      const data = instanceToPlain(presenter);
      expect(data).toStrictEqual({
        id: '01c539f8-7eef-487f-b973-7a4bc97df595',
        name: 'name',
        description: 'description',
        is_active: true,
        created_at: createdAt.toISOString(),
      });
    });
  });
});
