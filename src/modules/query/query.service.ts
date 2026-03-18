import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LangchainService } from '../ai/langchain.service';
import { RedisService } from '../cache/redis.service';
import { SqlValidator } from '../../common/sql-validator';
import * as crypto from 'crypto';

@Injectable()
export class QueryService {
  private readonly logger = new Logger(QueryService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly langchainService: LangchainService,
    private readonly redisService: RedisService,
  ) {}

  async generateInsight(question: string) {
    const cacheKey = `insight:${crypto.createHash('sha256').update(question.toLowerCase().trim()).digest('hex')}`;

    // Check cache first
    try {
      const cachedResult = await this.redisService.get(cacheKey);
      if (cachedResult) {
        this.logger.debug(`Cache hit for question: "${question}"`);
        return JSON.parse(cachedResult);
      }
    } catch (error) {
      this.logger.warn('Redis cache read failed, proceeding without cache', error?.message);
    }

    const schema = await this.databaseService.getDatabaseSchema();
    const generatedSql = await this.langchainService.generateSqlFromText(question, schema);

    if (!SqlValidator.isValidSelectQuery(generatedSql)) {
      this.logger.warn(`Invalid SQL generated: ${generatedSql}`);
      throw new BadRequestException('The generated query is not a valid SELECT statement.');
    }

    try {
      const data = await this.databaseService.executeQuery(generatedSql);

      this.logger.log(`Question: "${question}" | SQL: ${generatedSql}`);

      const result = {
        question,
        generatedSql,
        data,
      };

      this.redisService.set(cacheKey, JSON.stringify(result), 3600).catch((err) => {
        this.logger.warn('Redis cache write failed', err?.message);
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to execute query: ${generatedSql}`, error?.stack);
      throw new InternalServerErrorException('Error executing the validated SQL query on the database.');
    }
  }
}
