import { db } from "../db.ts";
import { userTable } from "../schemas/user.ts";
import type { newUser, updateUser, user, userInfo } from "../schemas/user.ts";
import { asc, eq, sql } from "drizzle-orm";

// Interface que define o contrato do repositório
export interface IUserRepository {
  findAll(): Promise<userInfo[]>;
  findById(uuid: string): Promise<user | undefined>;
  findByEmail(email: string): Promise<user | undefined>;
  create(data: newUser): Promise<user>;
  update(uuid: string, data: updateUser): Promise<user | undefined>;
  delete(uuid: string): Promise<boolean>;
  findWithAddresses(uuid: string): Promise<userInfo | undefined>;
  findPaginated(page: number, limit: number): Promise<{
    data: user[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }>;
}

// Implementação concreta do repositório
export class UserRepository implements IUserRepository {
  /**
   * Retorna todos os clientes
   */
  async findAll(): Promise<userInfo[]> {
    // Use the query API with relations instead of manual joins
    const users = await db.query.users.findMany({
      with: {
        addresses: true,
        role: true,
      },
    });
    return users;
  }

  /**
   * Busca um cliente pelo UUID
   */
  async findById(uuid: string): Promise<user | undefined> {
    const result = await db.query.users.findFirst({
      where: (users, { eq }) => (eq(users.uuid, uuid)),
      with: {
        addresses: true,
        role: true,
      },
    });

    return result;
  }

  /**
   * Busca um cliente pelo email
   */
  async findByEmail(email: string): Promise<user | undefined> {
    const [result] = await db.select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

    return result;
  }

  /**
   * Cria um novo cliente
   */
  async create(data: newUser): Promise<user> {
    const [result] = await db.insert(userTable)
      .values(data)
      .returning();

    return result;
  }

  /**
   * Atualiza um cliente existente
   */
  async update(
    uuid: string,
    data: updateUser,
  ): Promise<user | undefined> {
    const [result] = await db.update(userTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userTable.uuid, uuid))
      .returning();

    return result;
  }

  /**
   * Remove um cliente pelo UUID
   */
  async delete(uuid: string): Promise<boolean> {
    const [result] = await db.delete(userTable)
      .where(eq(userTable.uuid, uuid))
      .returning();

    return !!result;
  }

  async findWithAddresses(uuid: string): Promise<userInfo | undefined> {
    const user = await db.query.users.findFirst({
      where: (user, { eq }) => (eq(user.uuid, uuid)),
      with: {
        addresses: true,
        role: true,
      },
    });
    return user;
  }

  /**
   * Busca clientes com paginação
   */
  async findPaginated(page = 1, limit = 10): Promise<{
    data: user[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    // Calcular offset para paginação
    const offset = (page - 1) * limit;

    // Buscar dados com limite
    const data = await db.query.users.findMany({
      with: {
        // addresses: true,
        // role: true,
      },
      limit: limit,
      offset: offset,
      orderBy: (users) => asc(users.firstName),
    });
    // Contar total para paginação
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(
      userTable,
    );

    const total = Number(count);
    const pages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    };
  }

  async findUsersWithRole(roleId: number): Promise<user[]> {
    const users = await db.query.users.findMany({
      where: (user, { eq }) => eq(user.roleId, roleId),
      with: {
        role: true,
      },
    });
    return users;
  }
}
