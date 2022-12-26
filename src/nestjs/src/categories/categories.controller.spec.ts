import {
  CreateCategoryUseCase,
  GetCategoryUseCase,
  ListCategoriesUseCase,
  UpdateCategoryUseCase,
} from '@fc/micro-videos/category/application';
import { CategoriesController } from './categories.controller';
import { CreateCategoryDto } from './dto/create-category.dto';
import { SearchCategoryDto } from './dto/search-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesController Unit Tests', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    controller = new CategoriesController();
  });

  test('should create a category', async () => {
    const expectedOutput: CreateCategoryUseCase.Output = {
      id: 'd609e4c7-cc4d-4cd1-b2bb-0e59420a36ed',
      name: 'name',
      description: 'desc',
      is_active: true,
      created_at: new Date(),
    };

    const mockCreateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
    };

    //@ts-expect-error --- i know
    controller['createUseCase'] = mockCreateUseCase;

    const input: CreateCategoryDto = {
      name: 'name',
      description: 'desc',
      is_active: true,
    };

    const output = await controller.create(input);
    expect(mockCreateUseCase.execute).toBeCalledWith(input);
    expect(expectedOutput).toStrictEqual(output);
  });

  test('should update a category', async () => {
    const expectedOutput: UpdateCategoryUseCase.Output = {
      id: 'd609e4c7-cc4d-4cd1-b2bb-0e59420a36ed',
      name: 'name',
      description: 'desc',
      is_active: true,
      created_at: new Date(),
    };

    const mockUpdateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
    };

    //@ts-expect-error --- i know
    controller['updateUseCase'] = mockUpdateUseCase;

    const input: UpdateCategoryDto = {
      name: 'name',
      description: 'desc',
      is_active: true,
    };

    const output = await controller.update(expectedOutput.id, input);
    expect(mockUpdateUseCase.execute).toBeCalledWith({
      id: expectedOutput.id,
      ...input,
    });
    expect(expectedOutput).toStrictEqual(output);
  });

  test('should delete a category', async () => {
    const expectedOutput = undefined;
    const mockDeleteUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
    };

    //@ts-expect-error --- i know
    controller['deleteUseCase'] = mockDeleteUseCase;

    const id = 'd609e4c7-cc4d-4cd1-b2bb-0e59420a36ed';
    expect(controller.remove(id)).toBeInstanceOf(Promise);

    const output = await controller.remove(id);
    expect(mockDeleteUseCase.execute).toBeCalledWith({ id });
    expect(expectedOutput).toStrictEqual(output);
  });

  test('should get a category', async () => {
    const id = 'd609e4c7-cc4d-4cd1-b2bb-0e59420a36ed';
    const expectedOutput: GetCategoryUseCase.Output = {
      id,
      name: 'name',
      description: 'desc',
      is_active: true,
      created_at: new Date(),
    };

    const mockGetUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
    };

    //@ts-expect-error --- i know
    controller['getUseCase'] = mockGetUseCase;

    const output = await controller.findOne(id);
    expect(mockGetUseCase.execute).toBeCalledWith({ id });
    expect(expectedOutput).toStrictEqual(output);
  });

  test('should list categories', async () => {
    const expectedOutput: ListCategoriesUseCase.Output = {
      items: [
        {
          id: 'd609e4c7-cc4d-4cd1-b2bb-0e59420a36ed',
          name: 'name',
          description: 'desc',
          is_active: true,
          created_at: new Date(),
        },
      ],
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 1,
    };
    const searchParams: SearchCategoryDto = {
      page: 1,
    };

    const mockListUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
    };

    //@ts-expect-error --- i know
    controller['listUseCase'] = mockListUseCase;

    const output = await controller.search(searchParams);
    expect(mockListUseCase.execute).toBeCalledWith(searchParams);
    expect(expectedOutput).toStrictEqual(output);
  });
});
