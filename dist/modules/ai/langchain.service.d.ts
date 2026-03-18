import { ConfigService } from '@nestjs/config';
export declare class LangchainService {
    private readonly configService;
    private llm;
    private readonly logger;
    constructor(configService: ConfigService);
    generateSqlFromText(question: string, schema: string): Promise<string>;
    private reviewSql;
}
