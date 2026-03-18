import { QueryService } from './query.service';
import { QueryDto } from './dto/query.dto';
export declare class QueryController {
    private readonly queryService;
    constructor(queryService: QueryService);
    askQuestion(queryDto: QueryDto): Promise<any>;
}
