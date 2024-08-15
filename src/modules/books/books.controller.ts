import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  filter(@Query() query: { author: string; genre: string; title: string; publicationYear: number }) {
    return this.booksService.filter(query);
  }

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get(':bookId')
  findOne(@Param('bookId') id: string) {
    return this.booksService.findOne(+id);
  }

  @Patch(':bookId')
  update(@Param('bookId') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':bookId')
  remove(@Param('bookId') id: string) {
    return this.booksService.remove(+id);
  }
}
