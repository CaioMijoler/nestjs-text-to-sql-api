# Text-to-SQL Analytics Test Report
- **Date:** 2026-03-17 22:34:49
- **Endpoint:** `POST http://localhost:3001/insights`
- **Total Questions:** 10

---
## âœ… Test 1 â€” Quais sao os produtos mais populares entre os clientes corporativos?

- **Status:** `PASS`
- **Response Time:** 318.7s
### Generated SQL
```sql
SELECT p.product_name, COUNT(DISTINCT o.id) AS total_sales FROM products p INNER JOIN order_details od ON p.id = od.product_id INNER JOIN orders o ON od.order_id = o.id INNER JOIN customers c ON o.customer_id = c.id WHERE c.company IS NOT NULL AND c.company != '' GROUP BY p.product_name ORDER BY total_sales DESC
```

### Results (preview)
| product_name | total_sales |
| --- | --- |
| Northwind Traders Chocolate | 5 |
| Northwind Traders Coffee | 5 |
| Northwind Traders Green Tea | 4 |
| Northwind Traders Chocolate Biscuits Mix | 4 |
| Northwind Traders Clam Chowder | 4 |

*... and 19 more rows*

**Total rows returned:** 24
---

## âœ… Test 2 â€” Quais sao os produtos mais vendidos em termos de quantidade?

- **Status:** `PASS`
- **Response Time:** 0s
### Generated SQL
```sql
SELECT p.product_name, SUM(od.quantity) AS total_sold FROM products p INNER JOIN order_details od ON p.id = od.product_id GROUP BY p.product_name ORDER BY total_sold DESC
```

### Results (preview)
| product_name | total_sold |
| --- | --- |
| Northwind Traders Coffee | 650.0000 |
| Northwind Traders Beer | 487.0000 |
| Northwind Traders Clam Chowder | 290.0000 |
| Northwind Traders Green Tea | 275.0000 |
| Northwind Traders Chocolate | 200.0000 |

*... and 19 more rows*

**Total rows returned:** 24
---

## âœ… Test 3 â€” Qual e o volume de vendas por cidade?

- **Status:** `PASS`
- **Response Time:** 0s
### Generated SQL
```sql
SELECT SUM(od.quantity * od.unit_price) AS total_sales, c.city FROM order_details od JOIN orders o ON od.order_id = o.id JOIN customers c ON o.customer_id = c.id GROUP BY c.city
```

### Results (preview)
| total_sales | city |
| --- | --- |
| 2695.00000000 | Las Vegas |
| 4949.00000000 | New York |
| 4683.00000000 | Portland |
| 2905.50000000 | Denver |
| 2550.00000000 | Los Angelas |

*... and 7 more rows*

**Total rows returned:** 12
---

## âœ… Test 4 â€” Quais sao os clientes que mais compraram?

- **Status:** `PASS`
- **Response Time:** 301.2s
### Generated SQL
```sql
SELECT c.id AS id, CONCAT(c.first_name, ' ', c.last_name) AS NomeCliente FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id ORDER BY COUNT(o.id) DESC
```

### Results (preview)
| id | NomeCliente |
| --- | --- |
| 6 | Francisco P├®rez-Olaeta |
| 8 | Elizabeth Andersen |
| 4 | Christina Lee |
| 10 | Roland Wacker |
| 28 | Amritansh Raghav |

*... and 10 more rows*

**Total rows returned:** 15
---

## âœ… Test 5 â€” Quais sao os produtos mais caros da loja?

- **Status:** `PASS`
- **Response Time:** 285.5s
### Generated SQL
```sql
SELECT p.product_name, p.list_price FROM products p ORDER BY p.list_price DESC
```

### Results (preview)
| product_name | list_price |
| --- | --- |
| Northwind Traders Marmalade | 81.0000 |
| Northwind Traders Dried Apples | 53.0000 |
| Northwind Traders Coffee | 46.0000 |
| Northwind Traders Curry Sauce | 40.0000 |
| Northwind Traders Fruit Cocktail | 39.0000 |

*... and 40 more rows*

**Total rows returned:** 45
---

## âœ… Test 6 â€” Quais sao os fornecedores mais frequentes nos pedidos?

- **Status:** `PASS`
- **Response Time:** 310.4s
### Generated SQL
```sql
SELECT s.company, COUNT(DISTINCT o.id) AS total_orders FROM orders o JOIN order_details od ON o.id = od.order_id JOIN products p ON od.product_id = p.id JOIN suppliers s ON FIND_IN_SET(s.id, REPLACE(p.supplier_ids, ',', '')) > 0 GROUP BY s.company ORDER BY total_orders DESC
```

### Results (preview)
| company | total_orders |
| --- | --- |
| Supplier A | 9 |
| Supplier J | 9 |
| Supplier B | 5 |
| Supplier D | 5 |
| Supplier F | 5 |

*... and 4 more rows*

**Total rows returned:** 9
---

## âœ… Test 7 â€” Quais os melhores vendedores?

- **Status:** `PASS`
- **Response Time:** 294.6s
### Generated SQL
```sql
SELECT e.first_name, e.last_name, COUNT(o.id) AS total_sales FROM employees e JOIN orders o ON e.id = o.employee_id GROUP BY e.id ORDER BY total_sales DESC
```

### Results (preview)
| first_name | last_name | total_sales |
| --- | --- | --- |
| Nancy | Freehafer | 12 |
| Anne | Hellung-Larsen | 10 |
| Mariya | Sergienko | 8 |
| Jan | Kotas | 6 |
| Andrew | Cencini | 4 |

*... and 3 more rows*

**Total rows returned:** 8
---

## âœ… Test 8 â€” Qual e o valor total de todas as vendas realizadas por ano?

- **Status:** `PASS`
- **Response Time:** 295.7s
### Generated SQL
```sql
SELECT YEAR(o.order_date) AS Ano, SUM(od.quantity * od.unit_price) AS TotalVendas FROM orders o JOIN order_details od ON o.id = od.order_id GROUP BY Ano
```

### Results (preview)
| Ano | TotalVendas |
| --- | --- |
| 2006 | 68137.00000000 |

**Total rows returned:** 1
---

## âœ… Test 9 â€” Qual e o valor total de vendas por categoria de produto?

- **Status:** `PASS`
- **Response Time:** 334.4s
### Generated SQL
```sql
SELECT p.category, SUM(od.quantity * od.unit_price) AS total_sales FROM products p INNER JOIN order_details od ON p.id = od.product_id INNER JOIN orders o ON od.order_id = o.id GROUP BY p.category
```

### Results (preview)
| category | total_sales |
| --- | --- |
| Beverages | 38260.25000000 |
| Dried Fruit & Nuts | 3782.50000000 |
| Baked Goods & Mixes | 982.00000000 |
| Candy | 2550.00000000 |
| Soups | 2798.50000000 |

*... and 9 more rows*

**Total rows returned:** 14
---

## âœ… Test 10 â€” Qual o ticket medio por compra?

- **Status:** `PASS`
- **Response Time:** 319.2s
### Generated SQL
```sql
SELECT AVG(od.quantity * od.unit_price) AS revenue, COUNT(DISTINCT p.product_name) AS most_sold_products FROM products p INNER JOIN order_details od ON p.id = od.product_id GROUP BY p.product_name ORDER BY revenue DESC
```

### Results (preview)
| revenue | most_sold_products |
| --- | --- |
| 5980.000000000000 | 1 |
| 3240.000000000000 | 1 |
| 2272.666666666667 | 1 |
| 1950.000000000000 | 1 |
| 1566.000000000000 | 1 |

*... and 19 more rows*

**Total rows returned:** 24
---

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | 10 |
| Passed | 10 |
| Failed | 0 |
| Success Rate | 100% |
