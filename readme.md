Collecting workspace information# Pattern for Deno APIs - Architecture Documentation

## 📁 Estrutura de Pastas

```
.
├── .env                     # Variáveis de ambiente
├── .env.example             # Exemplo de variáveis de ambiente
├── deno.json                # Configuração do Deno e scripts
├── docker-compose.yml       # Configuração do Docker
├── drizzle.config.ts        # Configuração do ORM Drizzle
├── main.ts                  # Ponto de entrada da aplicação
│
├── infrastructure/          # Camada de Infraestrutura
│   └── database/
│       ├── db.ts            # Conexão com banco de dados
│       ├── helpers/         # Helpers para o banco de dados
│       ├── migrations/      # Migrações do banco de dados
│       ├── repositories/    # Implementações de repositórios
│       └── schemas/         # Schemas do Drizzle ORM
│
└── src/
    ├── api/                 # Camada de Apresentação/API
    │   ├── controllers/     # Controladores HTTP
    │   ├── middlewares/     # Middlewares HTTP
    │   └── routes/          # Definição de rotas
    │
    ├── application/         # Camada de Aplicação
    │   ├── events/          # Manipuladores de eventos
    │   └── services/        # Serviços de negócio
    │
    └── utils/               # Utilitários gerais
```

## 🏗️ Arquitetura da Aplicação

### Visão Geral

A arquitetura segue o princípio de **Clean Architecture** com separação clara de responsabilidades, permitindo:
- Testabilidade aprimorada
- Manutenção simplificada
- Desacoplamento entre camadas
- Substituição simples de tecnologias

## 📋 Camadas da Aplicação

### 1. Camada de Infraestrutura (infrastructure)

**Responsabilidades:**
- Implementação de detalhes técnicos
- Comunicação com bancos de dados e serviços externos
- Persistência de dados
- Implementações concretas de repositórios

**Componentes:**
- **database/db.ts**: Configuração de conexão com PostgreSQL usando Drizzle ORM
- **schemas/**: Definição das tabelas e relacionamentos
- **migrations/**: Scripts para evolução do banco de dados
- **repositories/**: Implementações concretas dos repositórios

**Exemplo:**
```typescript
// infrastructure/database/repositories/customer.repository.ts
import { db } from "../db.ts";
import { customerTable } from "../schemas/customer.ts";
import type { customer, newCustomer } from "../schemas/customer.ts";

export class CustomerRepository {
  async findById(uuid: string): Promise<customer | undefined> {
    const [result] = await db.query.customers.findMany({
      where: (customers, { eq }) => eq(customers.uuid, uuid),
      limit: 1,
    });
    return result;
  }

  async create(data: newCustomer): Promise<customer> {
    const [result] = await db.insert(customerTable).values(data).returning();
    return result;
  }
}
```

### 2. Camada de Aplicação (application)

**Responsabilidades:**
- Implementação de regras de negócio
- Orquestração de fluxos de trabalho
- Coordenação entre repositórios
- Validação de negócio e processamento de dados

**Componentes:**
- **services/**: Serviços que implementam lógica de negócio
- **events/**: Manipuladores de eventos do sistema

**Exemplo:**
```typescript
// src/application/services/customer.service.ts
import { CustomerRepository } from "../../../infrastructure/database/repositories/customer.repository.ts";
import type { customer, newCustomer } from "../../../infrastructure/database/schemas/customer.ts";

export class CustomerService {
  private customerRepository: CustomerRepository;

  constructor() {
    this.customerRepository = new CustomerRepository();
  }

  async getCustomerById(uuid: string): Promise<customer | undefined> {
    return await this.customerRepository.findById(uuid);
  }

  async createCustomer(data: newCustomer): Promise<customer> {
    // Validação de negócio antes de criar
    if (!this.isValidEmail(data.email)) {
      throw new Error("Email inválido");
    }
    
    return await this.customerRepository.create(data);
  }

  private isValidEmail(email: string): boolean {
    // Implementação de validação específica de negócio
    return email.includes("@") && email.includes(".");
  }
}
```

### 3. Camada de Apresentação/API (api)

**Responsabilidades:**
- Exposição de endpoints HTTP
- Interpretação de requisições HTTP
- Formatação de respostas
- Validação de entrada
- Gestão de autenticação/autorização

**Componentes:**
- **controllers/**: Manipulação de requisições HTTP
- **routes/**: Definição de rotas da API
- **middlewares/**: Funções intermediárias para processamento de requisições

**Exemplo:**
```typescript
// src/api/controllers/customer.controller.ts
import { Context } from "npm:hono";
import { CustomerService } from "../../application/services/customer.service.ts";
import { z } from "zod";

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  async getCustomer(c: Context) {
    const uuid = c.req.param("id");
    
    try {
      const customer = await this.customerService.getCustomerById(uuid);
      
      if (!customer) {
        return c.json({ message: "Cliente não encontrado" }, 404);
      }
      
      return c.json({ data: customer }, 200);
    } catch (error) {
      return c.json({ message: "Erro ao buscar cliente", error: error.message }, 500);
    }
  }

  async createCustomer(c: Context) {
    try {
      const body = await c.req.json();
      
      // Validação com Zod
      const schema = z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        email: z.string().email(),
        roleId: z.number()
      });
      
      const validatedData = schema.parse(body);
      const result = await this.customerService.createCustomer(validatedData);
      
      return c.json({ data: result }, 201);
    } catch (error) {
      if (error.name === "ZodError") {
        return c.json({ message: "Dados inválidos", errors: error.errors }, 400);
      }
      
      return c.json({ message: "Erro ao criar cliente", error: error.message }, 500);
    }
  }
}
```

### 4. Utilitários (utils)

**Responsabilidades:**
- Funções auxiliares reutilizáveis
- Funcionalidades independentes de contexto
- Helpers para tarefas comuns

**Exemplo:**
```typescript
// src/utils/password.ts
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

## 🔄 Fluxo de Dados

1. Uma requisição HTTP chega aos **routes** da API
2. O **controller** apropriado recebe a requisição
3. O **controller** valida os dados de entrada e chama o **service** adequado
4. O **service** executa a lógica de negócio e utiliza **repositories** para acessar dados
5. Os **repositories** interagem com o banco de dados através do ORM
6. O fluxo retorna na direção oposta com os dados resultantes

## 🌟 Benefícios desta Arquitetura

1. **Desacoplamento**: Mudanças em uma camada não afetam outras
2. **Testabilidade**: Cada componente pode ser testado isoladamente
3. **Manutenibilidade**: Código organizado facilita manutenção
4. **Escalabilidade**: Novos recursos podem ser adicionados com impacto mínimo
5. **Flexibilidade tecnológica**: Permite trocar tecnologias (ex: migrar de PostgreSQL para MySQL) com mudanças mínimas

## ⚙️ Tecnologias Utilizadas

- **Deno**: Runtime JavaScript/TypeScript moderno e seguro
- **Hono**: Framework HTTP leve e rápido
- **Drizzle ORM**: ORM TypeScript para bancos de dados relacionais
- **PostgreSQL**: Banco de dados relacional
- **Zod**: Biblioteca de validação com inferência de tipos
- **Docker**: Contêinerização para desenvolvimento consistente

## 🚀 Como Executar

```bash
# Iniciar o banco de dados
docker-compose up -d

# Criar migrações
deno task db:generate

# Aplicar migrações
deno task db:migrate

# Iniciar em modo desenvolvimento
deno task dev
