import { load } from "@std/dotenv";
import { db } from "../db.ts";
import { roleTable } from "../schemas/role.ts";
import { customerTable } from "../schemas/user.ts";
import { addressTable } from "../schemas/address.ts";

// Load environment variables
await load({ export: true });

/**
 * Seed role data
 */
async function seedRoles() {
  console.log("🌱 Seeding roles...");
  
  // Verificar se já existem roles
  const existingRoles = await db.select().from(roleTable);
  
  if (existingRoles.length > 0) {
    console.log("✓ Roles already seeded, skipping.");
    return existingRoles;
  }
  
  // Inserir roles
  const roles = await db.insert(roleTable)
    .values([
      { id: 1, name: "admin" },
      { id: 2, name: "Common" }
    ])
    .returning();
  
  console.log(`✅ ${roles.length} roles seeded successfully!`);
  return roles;
}

/**
 * Seed customer data
 */
async function seedCustomers() {
  console.log("🌱 Seeding customers...");
  
  // Verificar se já existem customers
  const existingCustomers = await db.select().from(customerTable);
  
  if (existingCustomers.length > 0) {
    console.log("✓ Customers already seeded, skipping.");
    return existingCustomers;
  }
  
  // Inserir clientes com referências às roles
  const customers = await db.insert(customerTable)
    .values([
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "555-123-4567",
        creditLimit: "1000.00",
        roleId: 1 // admin
      },
      {
        firstName: "Jane",
        middleName: "Maria",
        lastName: "Smith",
        email: "jane.smith@example.com",
        phone: "555-987-6543",
        creditLimit: "2000.00",
        roleId: 2 // common
      },
      {
        firstName: "Robert",
        lastName: "Johnson",
        email: "robert.johnson@example.com",
        phone: "555-456-7890",
        creditLimit: "1500.00",
        roleId: 2 // common
      }
    ])
    .returning();
  
  console.log(`✅ ${customers.length} customers seeded successfully!`);
  return customers;
}

/**
 * Seed address data
 */
async function seedAddresses(customers: typeof customerTable.$inferSelect[]) {
  console.log("🌱 Seeding addresses...");
  
  // Verificar se já existem addresses
  const existingAddresses = await db.select().from(addressTable);
  
  if (existingAddresses.length > 0) {
    console.log("✓ Addresses already seeded, skipping.");
    return;
  }
  
  // Criar array para armazenar endereços a inserir
  const addressesToInsert: typeof addressTable.$inferInsert[] = [];
  
  // Adicionar endereços para cada cliente
  for (const customer of customers) {
    // Endereço principal para todos os clientes
    addressesToInsert.push({
      street: `${Math.floor(Math.random() * 1000) + 1} Main Street`,
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
      customerId: customer.uuid
    });
    
    // Segundo endereço para alguns clientes (50% de chance)
    if (Math.random() > 0.5) {
      addressesToInsert.push({
        street: `${Math.floor(Math.random() * 1000) + 1} Broadway Ave`,
        city: "Los Angeles",
        state: "CA",
        zipCode: "90001",
        country: "USA",
        customerId: customer.uuid
      });
    }
  }
  
  // Inserir endereços no banco de dados
  const addresses = await db.insert(addressTable)
    .values(addressesToInsert)
    .returning();
  
  console.log(`✅ ${addresses.length} addresses seeded successfully!`);
}

/**
 * Função principal para executar todos os seeds
 */
async function main() {
  try {
    console.log("🚀 Starting database seed process...");
    
    // Executar seeds na ordem correta (respeitando chaves estrangeiras)
    await seedRoles();
    const customers = await seedCustomers();
    await seedAddresses(customers);
    
    console.log("✨ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Executar o seed se este arquivo for executado diretamente
if (import.meta.main) {
  await main();
}

// Exportar as funções para uso em outros módulos se necessário
export { seedRoles, seedCustomers, seedAddresses };