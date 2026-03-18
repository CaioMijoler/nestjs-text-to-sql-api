---
name: sql-query-reviewer
description: Valida e melhora queries SQL geradas garantindo correção, performance e aderência às regras.
metadata:
  author: caio-mijoler
  version: "1.0.0"
  argument-hint: <sql-query>
---

## Objective

Review and improve a SQL query to ensure correctness, performance, and adherence to best practices.

## Validation Rules

- Must be a valid MySQL SELECT query
- Must NOT contain INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE
- Must NOT use SELECT *
- Must use correct JOIN conditions
- Must avoid unnecessary subqueries
- Must use GROUP BY when aggregation is present
- Must ensure columns in SELECT are consistent with GROUP BY
- Must use ORDER BY when ranking is implied

## Optimization Guidelines

- Prefer INNER JOIN over subqueries when possible
- Remove redundant columns
- Simplify expressions
- Ensure aggregations are efficient
- Avoid duplicated joins

## Business Validation

- Revenue = SUM(quantity * unit_price)
- Most sold products = SUM(quantity)
- Ticket médio = AVG(order total)

## Output Rules

- Return ONLY the improved SQL query
- Do NOT include explanations
- Do NOT include markdown