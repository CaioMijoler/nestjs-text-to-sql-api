import { DatabaseService } from '../database/database.service';
import { LangchainService } from '../ai/langchain.service';
import { RedisService } from '../cache/redis.service';
export declare class QueryService {
    private readonly databaseService;
    private readonly langchainService;
    private readonly redisService;
    private readonly logger;
    constructor(databaseService: DatabaseService, langchainService: LangchainService, redisService: RedisService);
    generateInsight(question: string): Promise<any>;
}
