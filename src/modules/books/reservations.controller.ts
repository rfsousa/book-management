import { Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class ReservationsController {
  constructor(private readonly booksService: BooksService) {}

  @Post(':bookId/reserve')
  reserve(@Param('bookId', ParseIntPipe) id: number) {
    return this.booksService.reserveBook(id);
  }

  @Post('return/:reservationId')
  return(@Param('reservationId', ParseIntPipe) id: number) {
    return this.booksService.returnBook(id);
  }
}
