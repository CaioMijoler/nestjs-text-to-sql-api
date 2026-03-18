"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QueryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const langchain_service_1 = require("../ai/langchain.service");
const redis_service_1 = require("../cache/redis.service");
const sql_validator_1 = require("../../common/sql-validator");
const crypto = require("crypto");
let QueryService = QueryService_1 = class QueryService {
    constructor(databaseService, langchainService, redisService) {
        this.databaseService = databaseService;
        this.langchainService = langchainService;
        this.redisService = redisService;
        this.logger = new common_1.Logger(QueryService_1.name);
    }
    async generateInsight(question) {
        const cacheKey = `insight:${crypto.createHash('sha256').update(question.toLowerCase().trim()).digest('hex')}`;
        try {
            const cachedResult = await this.redisService.get(cacheKey);
            if (cachedResult) {
                this.logger.debug(`Cache hit for question: "${question}"`);
                return JSON.parse(cachedResult);
            }
        }
        catch (error) {
            this.logger.warn('Redis cache read failed, proceeding without cache', error?.message);
        }
        const schema = await this.databaseService.getDatabaseSchema();
        const generatedSql = await this.langchainService.generateSqlFromText(question, schema);
        if (!sql_validator_1.SqlValidator.isValidSelectQuery(generatedSql)) {
            this.logger.warn(`Invalid SQL generated: ${generatedSql}`);
            throw new common_1.BadRequestException('The generated query is not a valid SELECT statement.');
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
        }
        catch (error) {
            this.logger.error(`Failed to execute query: ${generatedSql}`, error?.stack);
            throw new common_1.InternalServerErrorException('Error executing the validated SQL query on the database.');
        }
    }
};
exports.QueryService = QueryService;
exports.QueryService = QueryService = QueryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        langchain_service_1.LangchainService,
        redis_service_1.RedisService])
], QueryService);
//# sourceMappingURL=query.service.js.map