import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListEventsQueryDto {
  @ApiPropertyOptional({ example: 'Music' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'uzh' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: '2026-02-01' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({
    enum: ['date', 'createdAt', 'title'],
    example: 'date',
  })
  @IsOptional()
  @IsIn(['date', 'createdAt', 'title'])
  sort?: 'date' | 'createdAt' | 'title';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @ApiPropertyOptional({ example: 20, description: 'Max 100' })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  @Min(0)
  offset?: number;
}
