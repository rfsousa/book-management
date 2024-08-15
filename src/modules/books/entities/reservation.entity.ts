import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { Book } from './book.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Book)
  book: Book;

  @CreateDateColumn()
  reservedAt: Date;

  @Column({ nullable: true })
  returnedAt: Date;
}
