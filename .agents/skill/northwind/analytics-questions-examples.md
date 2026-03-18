---
name: analytics-questions-examples
description: Exemplos de perguntas de negócio para orientar geração de SQL.
metadata:
  author: caio-mijoler
  version: "1.0.0"
  argument-hint: <natural-language-query>
---

## Example Questions

- Quais são os produtos mais vendidos?
- Quais são os produtos mais populares entre clientes corporativos?
- Qual é o volume de vendas por cidade?
- Quais clientes mais compraram?
- Quais são os produtos mais caros?
- Quais fornecedores aparecem com mais frequência?
- Quem são os melhores vendedores?
- Qual o total de vendas por ano?
- Qual o total de vendas por categoria?
- Qual o ticket médio por pedido?

## Intent Mapping

- "mais vendidos" → ORDER BY SUM(quantity) DESC
- "mais caros" → ORDER BY list_price DESC
- "volume de vendas" → SUM(quantity * unit_price)
- "ticket médio" → AVG(order total)
- "por cidade" → GROUP BY city
- "por ano" → GROUP BY YEAR(order_date)