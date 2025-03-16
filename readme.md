Use Drizzle as ORM

https://www.youtube.com/watch?v=hIYNOiZXQ7Y&ab_channel=Neon

https://www.youtube.com/watch?v=h-p4IiNW1UU&list=PLdcGGiDG9Q0j7pLzVcWvFptCPbENkfl7S&index=11&ab_channel=STSabbir

https://www.youtube.com/watch?v=i_mAHOhpBSA&ab_channel=Fireship

Remember _NEON_

```
Drizzle
src/
  ├── controllers/
  │   ├── customerController.ts
  │   ├── employeeController.ts
  │   └── orderController.ts
  ├── models/
  │   ├── Customer.ts
  │   ├── Employee.ts
  │   └── Order.ts
  ├── services/
  │   ├── customerService.ts
  │   ├── employeeService.ts
  │   └── orderService.ts
  ├── repositories/
  │   ├── customerRepository.ts
  │   ├── employeeRepository.ts
  │   └── orderRepository.ts
  ├── routes/
  │   ├── customerRoutes.ts
  │   ├── employeeRoutes.ts
  │   ├── orderRoutes.ts
  │   └── index.ts
  ├── middlewares/
  │   ├── logger.ts
  │   ├── auth.ts
  │   └── validation.ts
  ├── types/
  │   └── index.ts
  └── utils/
      ├── errors.ts
      └── validators.ts
```

```typescript
import { Hono } from "@hono/hono";
import { logger } from "./src/middlewares/logger.ts";
import customerRoutes from "./src/routes/customerRoutes.ts";
import employeeRoutes from "./src/routes/employeeRoutes.ts";
import orderRoutes from "./src/routes/orderRoutes.ts";

const app = new Hono();

// Global middleware
app.use("*", logger);

// Routes
app.route("/api/customers", customerRoutes);
app.route("/api/employees", employeeRoutes);
app.route("/api/orders", orderRoutes);

Deno.serve(app.fetch);
```

Key aspects of this organization:

1. **Controllers**: Handle HTTP requests and responses
2. **Services**: Contain business logic
3. **Repositories**: Handle data access
4. **Models**: Define data structures
5. **Routes**: Define API endpoints
6. **Middlewares**: Handle cross-cutting concerns

Features:

- **Customers**:
  - Registration
  - Order history
  - Loyalty points
- **Employees**:

  - Authentication
  - Role management (cook, cashier, manager)
  - Shift management

- **Orders**:
  - Order creation
  - Status tracking
  - Payment processing
