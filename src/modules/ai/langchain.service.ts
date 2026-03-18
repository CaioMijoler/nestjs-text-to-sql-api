import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOllama } from '@langchain/ollama';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LangchainService {
  private llm: ChatOllama;
  private readonly logger = new Logger(LangchainService.name);

  constructor(private readonly configService: ConfigService) {
    const baseUrl = this.configService.get<string>('OLLAMA_BASE_URL') || 'http://localhost:11434';
    const model = this.configService.get<string>('OLLAMA_MODEL') || 'llama3';

    this.llm = new ChatOllama({
      baseUrl,
      model,
      temperature: 0,
    });
  }

  async generateSqlFromText(question: string, schema: string): Promise<string> {
    const promptTemplatePath = path.join(process.cwd(), 'prompt', 'langchain-context.md');
    const template = fs.readFileSync(promptTemplatePath, 'utf-8');

    const prompt = template
      .replace('{{schema}}', schema)
      .replace('{{question}}', question);

    this.logger.debug(`Generating SQL for question: "${question}"`);

    const response = await this.llm.invoke(prompt);
    let sql = response.content.toString().trim();

    // Strip markdown code fences if the LLM wraps the output
    const sqlMatch = sql.match(/```(?:sql)?\s*([\s\S]*?)\s*```/);
    if (sqlMatch) {
      sql = sqlMatch[1].trim();
    }

    // Remove trailing semicolons
    sql = sql.replace(/;+\s*$/, '');

    this.logger.debug(`Raw generated SQL: ${sql}`);

    // SQL Review step — send the SQL back to the LLM for validation and optimization
    const reviewedSql = await this.reviewSql(sql, schema);

    this.logger.debug(`Reviewed SQL: ${reviewedSql}`);

    return reviewedSql;
  }

  private async reviewSql(sql: string, schema: string): Promise<string> {
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

    // Strip markdown code fences if present
    const sqlMatch = reviewed.match(/```(?:sql)?\s*([\s\S]*?)\s*```/);
    if (sqlMatch) {
      reviewed = sqlMatch[1].trim();
    }

    // Remove trailing semicolons
    reviewed = reviewed.replace(/;+\s*$/, '');

    // If the reviewer returns something invalid, fall back to the original
    const normalized = reviewed.toUpperCase();
    if (!normalized.startsWith('SELECT') || normalized.length < 10) {
      this.logger.warn('SQL reviewer returned invalid output, falling back to original SQL.');
      return sql;
    }

    return reviewed;
  }
}
