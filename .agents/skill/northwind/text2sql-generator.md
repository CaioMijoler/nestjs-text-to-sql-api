---
name: text2sql-generator
description: Converte linguagem natural em queries SQL MySQL otimizadas e seguras.
metadata:
  author: caio-mijoler
  version: "1.0.0"
  argument-hint: <natural-language-query>
---

## Objective

Transform natural language into a valid and optimized MySQL SELECT query.

## Strict Rules

- ONLY return raw SQL
- DO NOT include explanations
- DO NOT use markdown
- ONLY use SELECT statements
- NEVER use INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE

## SQL Guidelines

- Always use proper JOINs when multiple tables are needed
- Prefer INNER JOIN over subqueries when possible
- Use aliases for readability (e.g., c, o, od, p)
- Avoid SELECT *
- Only select necessary columns
- Use aggregation functions correctly (SUM, COUNT, AVG)
- Always include GROUP BY when using aggregations
- Use ORDER BY when ranking is implied (e.g., "top", "most")

## Business Logic Handling

- "Most sold products" → SUM(order_details.quantity)
- "Revenue" → SUM(order_details.quantity * order_details.unit_price)
- "Top customers" → GROUP BY customer_id + ORDER BY total DESC
- "Average ticket" → AVG(order total)

## Output Format

Return ONLY the SQL query.