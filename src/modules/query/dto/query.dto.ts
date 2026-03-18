import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryDto {
  @ApiProperty({
    description: 'The natural language question to ask the system',
    example: 'Quais são os produtos mais vendidos em termos de quantidade?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;
}
