import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { Reservation } from './entities/reservation.entity';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = this.bookRepository.create(createBookDto);
    return this.bookRepository.save(book);
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async filter(filterBookDto): Promise<Book[]> {
    const { author, genre, title, publicationYear } = filterBookDto;
    return this.bookRepository.find({
      where: {
        author,
        genre,
        title,
        publicationYear,
      },
    });
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    await this.bookRepository.update(id, updateBookDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.bookRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
  }

  async reserveBook(bookId: number): Promise<Reservation> {
    const book = await this.findOne(bookId);

    if (book.stock <= 0) {
      throw new BadRequestException('Book is out of stock');
    }

    book.stock -= 1;
    await this.bookRepository.save(book);

    const reservation = this.reservationRepository.create({ book });
    return this.reservationRepository.save(reservation);
  }

  async returnBook(reservationId: number): Promise<void> {
    const reservation = await this.reservationRepository.findOne({ where: { id: reservationId }, relations: ['book'] });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${reservationId} not found`);
    }

    if (reservation.returnedAt) {
      throw new BadRequestException('Book has already been returned');
    }

    reservation.returnedAt = new Date();
    await this.reservationRepository.save(reservation);

    const book = reservation.book;
    book.stock += 1;
    await this.bookRepository.save(book);
  }
}
