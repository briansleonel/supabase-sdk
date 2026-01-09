import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class QuerySwaggerDto {
  @ApiPropertyOptional({
    description: 'Maximum number of registers to return',
    example: 5,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of registers to skip for pagination',
    example: 0,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Filters in JSON format',
    example: JSON.stringify([
      {
        field: 'status',
        operator: 'IN',
        value: ['completed', 'failed'],
      },
    ]),
    type: String,
  })
  @IsOptional()
  @IsString()
  filters?: string;

  @ApiPropertyOptional({
    description: 'Field to order by',
    example: 'created_at',
    type: String,
  })
  @IsString()
  @IsOptional()
  orderBy?: string;

  @ApiPropertyOptional({
    description: 'Order direction',
    example: 'DESCENDENT',
    enum: ['ASCENDENT', 'DESCENDENT'],
    type: String,
  })
  @IsOptional()
  @IsString()
  orderDirection?: string;
}
