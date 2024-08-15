import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from '../src/modules/books/books.module';
import { Book } from '../src/modules/books/entities/book.entity';
import { Reservation } from '../src/modules/books/entities/reservation.entity';

describe('ReservationsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Book, Reservation],
          synchronize: true,
        }),
        BooksModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/books/:id/reserve (POST) should reserve a book', async () => {
    // Creates a book
    const book = await request(app.getHttpServer())
      .post('/books')
      .send({
        title: 'Test Book',
        author: 'Test Author',
        publicationYear: 2023,
        genre: 'Fiction',
        stock: 10,
      })
      .expect(201);

    const bookId = book.body.id;

    // Reserves the book
    const reservation = await request(app.getHttpServer())
      .post(`/books/${bookId}/reserve`)
      .expect(201);

    expect(reservation.body).toHaveProperty('id');
    expect(reservation.body.book.id).toBe(bookId);

    // Check the stock
    const updatedBook = await request(app.getHttpServer())
      .get(`/books/${bookId}`)
      .expect(200);

    expect(updatedBook.body.stock).toBe(9);
  });

  it('/books/return/:reservationId/ (POST) should return a book', async () => {
    // Creates a book
    const book = await request(app.getHttpServer())
      .post('/books')
      .send({
        title: 'Test Book',
        author: 'Test Author',
        publicationYear: 2023,
        genre: 'Fiction',
        stock: 10,
      })
      .expect(201);

    const bookId = book.body.id;

    // Reserves the book
    const reservation = await request(app.getHttpServer())
      .post(`/books/${bookId}/reserve`)
      .expect(201);

    const reservationId = reservation.body.id;

    // Returns the book
    await request(app.getHttpServer())
      .post(`/books/return/${reservationId}`)
      .expect(201);

    // Check stock
    const updatedBook = await request(app.getHttpServer())
      .get(`/books/${bookId}`)
      .expect(200);

    expect(updatedBook.body.stock).toBe(10);
  });
});
