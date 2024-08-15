import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from './modules/books/books.module';
import ormconfig from './config/ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
    BooksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
