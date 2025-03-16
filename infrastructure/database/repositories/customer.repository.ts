import { db } from "../db.ts";
import { customerTable } from "../schemas/customer.ts";
import type { customer, customerInfo, newCustomer, updateCustomer } from "../schemas/customer.ts";
import { eq, asc, sql } from "drizzle-orm";

// Interface que define o contrato do repositório
export interface ICustomerRepository {
  findAll(): Promise<customer[]>;
  findById(uuid: string): Promise<customer | undefined>;
  findByEmail(email: string): Promise<customer | undefined>;
  create(data: newCustomer): Promise<customer>;
  update(uuid: string, data: updateCustomer): Promise<customer | undefined>;
  delete(uuid: string): Promise<boolean>;
  findWithAddresses(uuid: string): Promise<customerInfo | undefined>;
}

// Implementação concreta do repositório
export class CustomerRepository implements ICustomerRepository {
 
  /**
   * Retorna todos os clientes
   */
  async findAll(): Promise<customerInfo[]> {
    // Use the query API with relations instead of manual joins
    const customers = await db.query.customers.findMany({
      with: {
        addresses: {
          columns:{
            id: true,
            street: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            customerId: true,
            createdAt: true,
            updatedAt: true
          }
        },
        role: {
          columns: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
    });
    
    return customers;
  }
  
  /**
   * Busca um cliente pelo UUID
   */
  async findById(uuid: string): Promise<customer | undefined> {
    const result = await db.query.customers.findFirst({
      where: (customers, { eq }) => (eq(customers.uuid, uuid)),
      with: {
        addresses:true,
        role:true
      }
    });
      
    return result;
  }
  
  /**
   * Busca um cliente pelo email
   */
  async findByEmail(email: string): Promise<customer | undefined> {
    const [result] = await db.select()
      .from(customerTable)
      .where(eq(customerTable.email, email))
      .limit(1);
      
    return result;
  }
  
  /**
   * Cria um novo cliente
   */
  async create(data: newCustomer): Promise<customer> {
    const [result] = await db.insert(customerTable)
      .values(data)
      .returning();
      
    return result;
  }
  
  /**
   * Atualiza um cliente existente
   */
  async update(uuid: string, data: updateCustomer): Promise<customer | undefined> {
    const [result] = await db.update(customerTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(customerTable.uuid, uuid))
      .returning();
      
    return result;
  }
  
  /**
   * Remove um cliente pelo UUID
   */
  async delete(uuid: string): Promise<boolean> {
    const [result] = await db.delete(customerTable)
      .where(eq(customerTable.uuid, uuid))
      .returning();
      
    return !!result;
  }
  
  async findWithAddresses(uuid: string): Promise<customerInfo | undefined> {
    const customer = await db.query.customers.findFirst({
      where: (customer, { eq }) => (eq(customer.uuid, uuid)),
      with: {
        addresses: true,
        role: true
      }
  });
    return customer;
  }
  
  /**
   * Busca clientes com paginação
   */
  async findPaginated(page = 1, limit = 10): Promise<{
    data: customer[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    }
  }> {
    // Calcular offset para paginação
    const offset = (page - 1) * limit;
    
    // Buscar dados com limite
    const data = await db.select()
      .from(customerTable)
      .limit(limit)
      .offset(offset)
      .orderBy(asc(customerTable.firstName));
    
    // Contar total para paginação
    const [{ count }] = await db.select({
      count: sql<number>`count(*)`
    }).from(customerTable);
    
    const total = Number(count);
    const pages = Math.ceil(total / limit);
    
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }


  /**
   * Busca clientes com paginação
   */
  async findNewPaginated(page = 1, limit = 10): Promise<{
    data: customer[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    }
  }> {
    // Calcular offset para paginação
    const offset = (page - 1) * limit;
    
    const data = await db.query.customers.findMany({
      with: {
        addresses:true,
        role:true
      },
      limit: limit,
      offset: offset,
      orderBy: (customers) => asc(customers.firstName)
    });
    // Buscar dados com limite
    // const data = await db.select()
    //   .from(customerTable)
    //   .limit(limit)
    //   .offset(offset)
    //   .orderBy(asc(customerTable.firstName));
    
    // Contar total para paginação
    // const [{ count }] = await db.select({
    //   count: sql<number>`count(*)`
    // }).from(customerTable);
    
    const total = Number(count);
    const pages = Math.ceil(total / limit);
    
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }
}




