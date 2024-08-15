import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { Reservation } from './entities/reservation.entity';

describe('BooksService', () => {
  let service: BooksService;
  let bookRepository: Repository<Book>;
  let reservationRepository: Repository<Reservation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Reservation),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    bookRepository = module.get<Repository<Book>>(getRepositoryToken(Book));
    reservationRepository = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const createBookDto: CreateBookDto = { title: 'Test Book', author: 'Author', genre: 'Fiction', publicationYear: 2022, stock: 10 };
      const result = { id: 1, ...createBookDto } as Book;

      jest.spyOn(bookRepository, 'create').mockReturnValue(result);
      jest.spyOn(bookRepository, 'save').mockResolvedValue(result);

      expect(await service.create(createBookDto)).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a single book', async () => {
      const result = { id: 1, title: 'Test Book' } as Book;
      jest.spyOn(bookRepository, 'findOne').mockResolvedValue(result);

      expect(await service.findOne(1)).toEqual(result);
    });

    it('should throw an error if book not found', async () => {
      jest.spyOn(bookRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne(1)).rejects.toThrow('Book with ID 1 not found');
    });
  });

  describe('filter', () => {
    it('should return an array of books', async () => {
      const filterBookDto = { author: 'Author', genre: 'Fiction', title: 'Test Book', publicationYear: 2022 };
      const result = [{ id: 1, title: 'Test Book' }] as Book[];
      jest.spyOn(bookRepository, 'find').mockResolvedValue(result);

      expect(await service.filter(filterBookDto)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const updateBookDto: UpdateBookDto = { title: 'Updated Book' };
      const result = { id: 1, ...updateBookDto } as Book;

      jest.spyOn(service, 'findOne').mockResolvedValue(result);
      jest.spyOn(bookRepository, 'update').mockResolvedValue(undefined);

      expect(await service.update(1, updateBookDto)).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a book', async () => {
      jest.spyOn(bookRepository, 'delete').mockResolvedValue({ affected: 1, raw: [] });

      expect(await service.remove(1)).toBeUndefined();
    });

    it('should throw an error if book not found', async () => {
      jest.spyOn(bookRepository, 'delete').mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(1)).rejects.toThrow('Book with ID 1 not found');
    });
  });

  describe('reserveBook', () => {
    it('should reserve a book', async () => {
      const book = { id: 1, title: 'Test Book', stock: 5 } as Book;
      const reservation = { id: 1, book } as Reservation;

      jest.spyOn(service, 'findOne').mockResolvedValue(book);
      jest.spyOn(bookRepository, 'save').mockResolvedValue(book);
      jest.spyOn(reservationRepository, 'create').mockReturnValue(reservation);
      jest.spyOn(reservationRepository, 'save').mockResolvedValue(reservation);

      expect(await service.reserveBook(1)).toEqual(reservation);
    });

    it('should throw an error if book is out of stock', async () => {
      const book = { id: 1, title: 'Test Book', stock: 0 } as Book;
      jest.spyOn(service, 'findOne').mockResolvedValue(book);

      await expect(service.reserveBook(1)).rejects.toThrow('Book is out of stock');
    });
  });

  describe('returnBook', () => {
    it('should return a book', async () => {
      const book = { id: 1, title: 'Test Book', stock: 4 } as Book;
      const reservation = { id: 1, book, returnedAt: null } as Reservation;

      jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(reservation);
      jest.spyOn(reservationRepository, 'save').mockResolvedValue(reservation);
      jest.spyOn(bookRepository, 'save').mockResolvedValue(book);

      await service.returnBook(1);

      expect(reservation.returnedAt).not.toBeNull();
      expect(book.stock).toBe(5);
    });

    it('should throw an error if reservation not found', async () => {
      jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.returnBook(1)).rejects.toThrow('Reservation with ID 1 not found');
    });

    it('should throw an error if book has already been returned', async () => {
      const reservation = { id: 1, returnedAt: new Date() } as Reservation;
      jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(reservation);

      await expect(service.returnBook(1)).rejects.toThrow('Book has already been returned');
    });
  });
});
