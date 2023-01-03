import { instanceToPlain } from 'class-transformer';
import { PaginationPresenter } from '../../@share/presenters/pagination.presenter';
import {
  CategoryCollectionPresenter,
  CategoryPresenter,
} from './category.presenter';

describe('CategoryPresenter Unit Tests', () => {
  describe('constructor', () => {
    test('should set values', () => {
      const createdAt = new Date();
      const presenter = new CategoryPresenter({
        id: '60b0a763-b60d-44f5-a4a2-f42699cea540',
        name: 'name',
        description: 'description',
        is_active: true,
        created_at: createdAt,
      });

      expect(presenter.id).toBe('60b0a763-b60d-44f5-a4a2-f42699cea540');
      expect(presenter.name).toBe('name');
      expect(presenter.description).toBe('description');
      expect(presenter.is_active).toBe(true);
      expect(presenter.created_at).toBe(createdAt);
    });

    test('should present data', () => {
      const createdAt = new Date();
      const presenter = new CategoryPresenter({
        id: '60b0a763-b60d-44f5-a4a2-f42699cea540',
        name: 'name',
        description: 'description',
        is_active: true,
        created_at: createdAt,
      });

      const data = instanceToPlain(presenter);
      expect(data).toStrictEqual({
        id: '60b0a763-b60d-44f5-a4a2-f42699cea540',
        name: 'name',
        description: 'description',
        is_active: true,
        created_at: createdAt.toISOString(),
      });
    });
  });
});

describe('CategoryCollectionPresenter Unit Tests', () => {
  describe('constructor', () => {
    test('should set values', () => {
      const created_at = new Date();
      const presenter = new CategoryCollectionPresenter({
        items: [
          {
            id: '60b0a763-b60d-44f5-a4a2-f42699cea540',
            name: 'movie',
            description: 'some description',
            is_active: true,
            created_at,
          },
        ],
        current_page: 1,
        per_page: 2,
        last_page: 3,
        total: 4,
      });

      expect(presenter.meta).toBeInstanceOf(PaginationPresenter);
      expect(presenter.meta).toEqual(
        new PaginationPresenter({
          current_page: 1,
          per_page: 2,
          last_page: 3,
          total: 4,
        }),
      );
      expect(presenter.data).toStrictEqual([
        new CategoryPresenter({
          id: '60b0a763-b60d-44f5-a4a2-f42699cea540',
          name: 'movie',
          description: 'some description',
          is_active: true,
          created_at,
        }),
      ]);
    });
  });

  test('should present data correctly', () => {
    const created_at = new Date();
    let presenter = new CategoryCollectionPresenter({
      items: [
        {
          id: '60b0a763-b60d-44f5-a4a2-f42699cea540',
          name: 'movie',
          description: 'some description',
          is_active: true,
          created_at,
        },
      ],
      current_page: 1,
      per_page: 2,
      last_page: 3,
      total: 4,
    });

    expect(instanceToPlain(presenter)).toStrictEqual({
      meta: {
        current_page: 1,
        per_page: 2,
        last_page: 3,
        total: 4,
      },
      data: [
        {
          id: '60b0a763-b60d-44f5-a4a2-f42699cea540',
          name: 'movie',
          description: 'some description',
          is_active: true,
          created_at: created_at.toISOString(),
        },
      ],
    });

    presenter = new CategoryCollectionPresenter({
      items: [
        {
          id: '60b0a763-b60d-44f5-a4a2-f42699cea540',
          name: 'movie',
          description: 'some description',
          is_active: true,
          created_at,
        },
      ],
      current_page: '1' as any,
      per_page: '2' as any,
      last_page: '3' as any,
      total: '4' as any,
    });

    expect(instanceToPlain(presenter)).toStrictEqual({
      meta: {
        current_page: 1,
        per_page: 2,
        last_page: 3,
        total: 4,
      },
      data: [
        {
          id: '60b0a763-b60d-44f5-a4a2-f42699cea540',
          name: 'movie',
          description: 'some description',
          is_active: true,
          created_at: created_at.toISOString(),
        },
      ],
    });
  });
});
