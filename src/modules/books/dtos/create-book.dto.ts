import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsInt()
  publicationYear: number;

  @IsString()
  genre: string;

  @IsInt()
  stock: number;
}
