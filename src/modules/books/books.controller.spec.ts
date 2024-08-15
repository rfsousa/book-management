import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { Book } from './entities/book.entity';

describe('BooksController', () => {
  let booksController: BooksController;
  let booksService: BooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            filter: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            reserveBook: jest.fn(),
            returnBook: jest.fn(),
          },
        },
      ],
    }).compile();

    booksController = module.get<BooksController>(BooksController);
    booksService = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(booksController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const createBookDto: CreateBookDto = { title: 'Test Book', author: 'Author', genre: 'Fiction', publicationYear: 2022, stock: 10 };
      const result = { id: 1, ...createBookDto };
      jest.spyOn(booksService, 'create').mockResolvedValue(result as Book);

      expect(await booksController.create(createBookDto)).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a single book', async () => {
      const bookId = '1';
      const result = { id: +bookId, title: 'Test Book' } as Book;
      jest.spyOn(booksService, 'findOne').mockResolvedValue(result);

      expect(await booksController.findOne(bookId)).toEqual(result);
    });
  });

  describe('filter', () => {
    it('should return an array of books', async () => {
      const query = { author: 'Author', genre: 'Fiction', title: 'Test Book', publicationYear: 2022 };
      const result = [{ id: 1, title: 'Test Book' }] as Book[];
      jest.spyOn(booksService, 'filter').mockResolvedValue(result);

      expect(await booksController.filter(query)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const updateBookDto: UpdateBookDto = { title: 'Updated Book' };
      const result = { id: 1, ...updateBookDto } as Book;
      jest.spyOn(booksService, 'update').mockResolvedValue(result);

      expect(await booksController.update('1', updateBookDto)).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a book', async () => {
      jest.spyOn(booksService, 'remove').mockResolvedValue(undefined);

      expect(await booksController.remove('1')).toBeUndefined();
    });
  });
});
