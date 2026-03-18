# 📊 FinTechX — Intelligent Text-to-SQL Insights

Solução de **Inteligência Artificial Aplicada** que converte linguagem natural em queries SQL otimizadas. Permite que usuários de negócio extraiam insights estratégicos do banco Northwind sem escrever SQL.

## 🏗️ Arquitetura

```
                    ┌──────────────┐
                    │   Analyst /  │
                    │ Business User│
                    └──────┬───────┘
                           │ POST /insights
                           │ { "question": "..." }
                           ▼
                    ┌──────────────┐
                    │  NestJS API  │
                    │ (Controller) │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌────────────┐ ┌────────┐ ┌───────────┐
       │   Redis    │ │ Ollama │ │  MySQL    │
       │  (Cache)   │ │ (LLM)  │ │(Northwind)│
       └────────────┘ └────────┘ └───────────┘
```

### Fluxo de Execução

1. Usuário envia pergunta em linguagem natural via `POST /insights`
2. `QueryService` verifica o cache Redis (SHA256 da pergunta)
3. **Cache HIT** → retorna resultado imediato (~0s)
4. **Cache MISS** → extrai schema do banco (tabelas + colunas + FKs)
5. `LangchainService` gera SQL via LLM com prompt otimizado
6. SQL passa por uma **etapa de revisão** (segundo LLM call)
7. `SqlValidator` valida a query (SELECT-only, sem SELECT *, sem DML)
8. Executa no MySQL e salva resultado no cache (TTL 1h)

> Diagrama de sequência completo: [`sequence-diagram.puml`](sequence-diagram.puml)
> Diagrama C4 Container: [`c3.puml`](c3.puml)

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Função |
|--------|-----------|--------|
| **Backend** | NestJS (TypeScript) | API REST, orquestração do pipeline |
| **AI Framework** | LangChain.js | Integração com LLM |
| **LLM** | Ollama (codeqwen:v1.5) | Geração e revisão de SQL |
| **Cache** | Redis | Cache de queries e resultados (TTL 1h) |
| **Database** | MySQL (Pool) | Northwind database, connection pool com keep-alive |
| **Docs** | Swagger | Documentação interativa em `/` |

## 🔧 Pré-requisitos

- Node.js v18+
- Docker e Docker Compose
- Redis

## 🚀 Setup Rápido

**1. Instale as dependências:**
```bash
npm install
```

**2. Inicie o Ollama via Docker e baixe o modelo:**
```bash
docker run -d -p 11434:11434 --name ollama ollama/ollama
docker exec ollama ollama pull codeqwen:v1.5
```

**3. Configure o `.env`:**
```env
# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=sua_senha
DB_NAME=northwind

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=codeqwen:v1.5
```

**4. Inicie a aplicação:**
```bash
npm run start:dev
```

**5. Acesse o Swagger:**

Abra [http://localhost:3001](http://localhost:3001) para a documentação interativa.

## 📡 API

### `POST /insights`

Converte uma pergunta em linguagem natural em SQL e retorna os resultados.

**Request:**
```json
{
  "question": "Quais são os produtos mais vendidos em termos de quantidade?"
}
```

**Response (200):**
```json
{
  "question": "Quais são os produtos mais vendidos em termos de quantidade?",
  "generatedSql": "SELECT p.product_name, SUM(od.quantity) AS total_sold FROM products AS p JOIN order_details AS od ON p.id = od.product_id GROUP BY p.product_name ORDER BY total_sold DESC",
  "data": [
    { "product_name": "Northwind Traders Coffee", "total_sold": 650 },
    { "product_name": "Northwind Traders Beer", "total_sold": 487 }
  ]
}
```

**Errors:**
| Status | Causa |
|--------|-------|
| 400 | SQL gerado não é um SELECT válido |
| 500 | Erro na execução da query no banco |

## 🧪 Testes

Execute o script de testes com as 10 perguntas de negócio:

```powershell
powershell -ExecutionPolicy Bypass -File test\run-analytics-tests.ps1
```

Resultado: relatório Markdown gerado em `test/analytics-test-report.md` com SQL gerado, preview de dados, tempo de resposta e taxa de sucesso.

### Perguntas de Teste

| # | Pergunta |
|---|---------|
| 1 | Quais são os produtos mais populares entre os clientes corporativos? |
| 2 | Quais são os produtos mais vendidos em termos de quantidade? |
| 3 | Qual é o volume de vendas por cidade? |
| 4 | Quais são os clientes que mais compraram? |
| 5 | Quais são os produtos mais caros da loja? |
| 6 | Quais são os fornecedores mais frequentes nos pedidos? |
| 7 | Quais os melhores vendedores? |
| 8 | Qual é o valor total de todas as vendas realizadas por ano? |
| 9 | Qual é o valor total de vendas por categoria de produto? |
| 10 | Qual o ticket médio por compra? |

## 📂 Estrutura do Projeto

```
src/
├── common/
│   └── sql-validator.ts          # Validação de queries (SELECT-only, sem DML)
├── modules/
│   ├── ai/
│   │   └── langchain.service.ts  # Geração + revisão de SQL via LLM
│   ├── cache/
│   │   └── redis.service.ts      # Cache Redis com TTL
│   ├── database/
│   │   └── database.service.ts   # Pool MySQL + extração de schema/FKs
│   └── query/
│       ├── dto/query.dto.ts      # Validação do payload
│       ├── query.controller.ts   # POST /insights
│       └── query.service.ts      # Orquestração do pipeline
├── app.module.ts
└── main.ts
prompt/
└── langchain-context.md          # Prompt template com few-shot examples
test/
├── run-analytics-tests.ps1       # Script de testes automatizado
└── analytics-test-report.md      # Relatório de resultados
```

## 🔒 Segurança

- **Read-only**: apenas `SELECT` permitido — `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE` são bloqueados
- **SQL Injection prevention**: validação em múltiplas camadas (LLM prompt rules + SqlValidator + parameterized schema queries)
- **CORS**: configurado para origens específicas
- **Cache resiliente**: falhas no Redis não derrubam a API

## 📈 Evolução para Produção

| Componente | Local | Cloud |
|-----------|-------|-------|
| API | NestJS local | AWS EKS (containers) |
| LLM | Ollama (codeqwen) | Azure OpenAI / DeepSeek API |
| Cache | Redis local | AWS ElastiCache |
| Database | MySQL single | AWS Aurora (read replicas) |
| Monitoring | Winston logs | CloudWatch + Datadog |