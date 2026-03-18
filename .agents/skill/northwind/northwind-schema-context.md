---
name: northwind-schema-context
description: Estrutura e relacionamentos do banco Northwind para geração de SQL.
metadata:
  author: caio-mijoler
  version: "1.0.0"
---

## Core Tables

### customers
- id
- company
- city
- country_region

### orders
- id
- customer_id
- employee_id
- order_date
- shipped_date
- ship_city
- ship_country_region

### order_details
- id
- order_id
- product_id
- quantity
- unit_price
- discount

### products
- id
- product_name
- list_price
- category

### employees
- id
- first_name
- last_name

### suppliers
- id
- company

---

## Relationships

- orders.customer_id → customers.id
- orders.employee_id → employees.id
- order_details.order_id → orders.id
- order_details.product_id → products.id

---

## Important Notes

- Revenue = quantity * unit_price
- Discount may be applied but is optional
- product.supplier_ids is not normalized (avoid using if possible)
