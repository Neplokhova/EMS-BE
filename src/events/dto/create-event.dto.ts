import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Concert' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: '2023-12-25' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 'Central Park' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location!: string;

  @ApiProperty({ example: 'Music' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category!: string;

  @ApiProperty({ example: 'A great concert with amazing performers.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string;
}
