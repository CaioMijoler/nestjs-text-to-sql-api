import { Controller, Post, Body } from '@nestjs/common';
import { QueryService } from './query.service';
import { QueryDto } from './dto/query.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Text-to-SQL')
@Controller('insights')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post()
  @ApiOperation({ summary: 'Pergunte sobre algum insights sobre a empresa FinTechX.' })
  @ApiResponse({ status: 201, description: 'The generated SQL and results.' })
  @ApiResponse({ status: 400, description: 'Generated query is not a valid SELECT.' })
  async askQuestion(@Body() queryDto: QueryDto) {
    return this.queryService.generateInsight(queryDto.question);
  }
}
