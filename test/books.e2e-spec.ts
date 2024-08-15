import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from '../src/modules/books/books.module';
import { Book } from '../src/modules/books/entities/book.entity';

describe('BooksController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Book],
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

  it('/books (POST) should create a book', async () => {
    const response = await request(app.getHttpServer())
      .post('/books')
      .send({
        title: 'Test Book',
        author: 'Test Author',
        publicationYear: 2023,
        genre: 'Fiction',
        stock: 10,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Book');
    expect(response.body.author).toBe('Test Author');
    expect(response.body.publicationYear).toBe(2023);
    expect(response.body.genre).toBe('Fiction');
    expect(response.body.stock).toBe(10);
  });

  it('/books (GET) should filter books', async () => {
    await request(app.getHttpServer())
      .post('/books')
      .send({
        title: 'Book 1',
        author: 'Author 1',
        publicationYear: 2021,
        genre: 'Sci-Fi',
        stock: 5,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/books')
      .send({
        title: 'Book 2',
        author: 'Author 2',
        publicationYear: 2022,
        genre: 'Fantasy',
        stock: 8,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/books')
      .query({ author: 'Author 1', genre: 'Sci-Fi' })
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Book 1');
  });

  it('/books/:bookId (GET) should retrieve a book by ID', async () => {
    const book = await request(app.getHttpServer())
      .post('/books')
      .send({
        title: 'Book to Retrieve',
        author: 'Some Author',
        publicationYear: 2020,
        genre: 'Horror',
        stock: 3,
      })
      .expect(201);

    const bookId = book.body.id;

    const response = await request(app.getHttpServer())
      .get(`/books/${bookId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', bookId);
    expect(response.body.title).toBe('Book to Retrieve');
    expect(response.body.author).toBe('Some Author');
    expect(response.body.publicationYear).toBe(2020);
    expect(response.body.genre).toBe('Horror');
    expect(response.body.stock).toBe(3);
  });

  it('/books/:bookId (PATCH) should update a book by ID', async () => {
    const book = await request(app.getHttpServer())
      .post('/books')
      .send({
        title: 'Book to Update',
        author: 'Another Author',
        publicationYear: 2019,
        genre: 'Computer Science',
        stock: 7,
      })
      .expect(201);

    const bookId = book.body.id;

    const updatedBook = await request(app.getHttpServer())
      .patch(`/books/${bookId}`)
      .send({
        title: 'Updated Book Title',
        author: 'Updated Author',
        genre: 'Mystery',
      })
      .expect(200);

    expect(updatedBook.body.title).toBe('Updated Book Title');
    expect(updatedBook.body.author).toBe('Updated Author');
    expect(updatedBook.body.genre).toBe('Mystery');
    expect(updatedBook.body.publicationYear).toBe(2019);
    expect(updatedBook.body.stock).toBe(7);
  });

  it('/books/:bookId (DELETE) should remove a book by ID', async () => {
    const book = await request(app.getHttpServer())
      .post('/books')
      .send({
        title: 'Book to Delete',
        author: 'Delete Author',
        publicationYear: 2018,
        genre: 'Novel',
        stock: 4,
      })
      .expect(201);

    const bookId = book.body.id;

    await request(app.getHttpServer())
      .delete(`/books/${bookId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/books/${bookId}`)
      .expect(404);
  });
});
