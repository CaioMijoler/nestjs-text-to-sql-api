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
var LangchainService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangchainService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ollama_1 = require("@langchain/ollama");
const fs = require("fs");
const path = require("path");
let LangchainService = LangchainService_1 = class LangchainService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(LangchainService_1.name);
        const baseUrl = this.configService.get('OLLAMA_BASE_URL') || 'http://localhost:11434';
        const model = this.configService.get('OLLAMA_MODEL') || 'llama3';
        this.llm = new ollama_1.ChatOllama({
            baseUrl,
            model,
            temperature: 0,
        });
    }
    async generateSqlFromText(question, schema) {
        const promptTemplatePath = path.join(process.cwd(), 'prompt', 'langchain-context.md');
        const template = fs.readFileSync(promptTemplatePath, 'utf-8');
        const prompt = template
            .replace('{{schema}}', schema)
            .replace('{{question}}', question);
        this.logger.debug(`Generating SQL for question: "${question}"`);
        const response = await this.llm.invoke(prompt);
        let sql = response.content.toString().trim();
        const sqlMatch = sql.match(/```(?:sql)?\s*([\s\S]*?)\s*```/);
        if (sqlMatch) {
            sql = sqlMatch[1].trim();
        }
        sql = sql.replace(/;+\s*$/, '');
        this.logger.debug(`Raw generated SQL: ${sql}`);
        const reviewedSql = await this.reviewSql(sql, schema);
        this.logger.debug(`Reviewed SQL: ${reviewedSql}`);
        return reviewedSql;
    }
    async reviewSql(sql, schema) {
        const reviewPrompt = `You are a strict SQL reviewer. Your sole purpose is to validate and improve the given SQL query.

## RULES
- The query MUST be a valid MySQL SELECT query.
- It must NOT contain INSERT, UPDATE, DELETE, DROP, ALTER, or TRUNCATE.
- It must NOT use SELECT *.
- It must use correct JOIN conditions based on the schema relationships.
- It must avoid unnecessary subqueries (prefer INNER JOIN).
- It must include GROUP BY when aggregation functions are present.
- Columns in SELECT must be consistent with GROUP BY.
- It must use ORDER BY when ranking is implied.
- Remove redundant columns and simplify expressions.
- Revenue = SUM(od.quantity * od.unit_price)
- Most sold products = SUM(od.quantity)

## DATABASE SCHEMA
${schema}

## RELATIONSHIPS
- orders.customer_id → customers.id
- orders.employee_id → employees.id
- order_details.order_id → orders.id
- order_details.product_id → products.id

## SQL TO REVIEW
${sql}

## OUTPUT
Return ONLY the improved SQL query. No markdown. No explanations. No semicolon at the end.`;
        const response = await this.llm.invoke(reviewPrompt);
        let reviewed = response.content.toString().trim();
        const sqlMatch = reviewed.match(/```(?:sql)?\s*([\s\S]*?)\s*```/);
        if (sqlMatch) {
            reviewed = sqlMatch[1].trim();
        }
        reviewed = reviewed.replace(/;+\s*$/, '');
        const normalized = reviewed.toUpperCase();
        if (!normalized.startsWith('SELECT') || normalized.length < 10) {
            this.logger.warn('SQL reviewer returned invalid output, falling back to original SQL.');
            return sql;
        }
        return reviewed;
    }
};
exports.LangchainService = LangchainService;
exports.LangchainService = LangchainService = LangchainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LangchainService);
//# sourceMappingURL=langchain.service.js.map