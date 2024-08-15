import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './entities/book.entity';
import { Reservation } from './entities/reservation.entity';
import { ReservationsController } from './reservations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Reservation])],
  controllers: [BooksController, ReservationsController],
  providers: [BooksService],
})
export class BooksModule {}
