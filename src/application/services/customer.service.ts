import { 
  CustomerRepository, 
  ICustomerRepository 
} from "../../../infrastructure/database/repositories/customer.repository.ts";
import type { 
  customer, 
  customerInfo, 
  newCustomer, 
  updateCustomer 
} from "../../../infrastructure/database/schemas/customer.ts";

export class CustomerService {
  private customerRepository: ICustomerRepository;

  constructor(customerRepository?: ICustomerRepository) {
    this.customerRepository = customerRepository || new CustomerRepository();
  }

  /**
   * Get all customers with pagination support
   */
  async getAllCustomers(page = 1, limit = 10) {
    return await this.customerRepository.findPaginated(page, limit);
  }

  /**
   * Get a customer by UUID with their addresses
   */
  async getCustomerById(uuid: string): Promise<customerInfo | undefined> {
    return await this.customerRepository.findWithAddresses(uuid);
  }

  /**
   * Create a new customer with validation
   */
  async createCustomer(data: newCustomer): Promise<customer> {
    // Business validation: check if email already exists
    const existingCustomer = await this.customerRepository.findByEmail(data.email);
    if (existingCustomer) {
      throw new Error("Email already in use");
    }

    // Business validation: validate credit limit
    if (data.creditLimit && parseFloat(data.creditLimit.toString()) < 0) {
      throw new Error("Credit limit cannot be negative");
    }

    // Create customer
    return await this.customerRepository.create(data);
  }

  /**
   * Update a customer with validation
   */
  async updateCustomer(uuid: string, data: updateCustomer): Promise<customer | undefined> {
    // Check if customer exists
    const customer = await this.customerRepository.findById(uuid);
    if (!customer) {
      throw new Error("Customer not found");
    }

    // If email is being updated, check for uniqueness
    if (data.email && data.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findByEmail(data.email);
      if (existingCustomer) {
        throw new Error("Email already in use by another customer");
      }
    }

    // Business validation: validate credit limit
    if (data.creditLimit && parseFloat(data.creditLimit.toString()) < 0) {
      throw new Error("Credit limit cannot be negative");
    }

    return await this.customerRepository.update(uuid, data);
  }

  /**
   * Delete a customer
   */
  async deleteCustomer(uuid: string): Promise<boolean> {
    // Check if customer exists
    const customer = await this.customerRepository.findById(uuid);
    if (!customer) {
      throw new Error("Customer not found");
    }

    return await this.customerRepository.delete(uuid);
  }


  /**
   * Business logic: Check if customer has sufficient credit
   */
  async hasCredit(customerId: string, amount: number): Promise<boolean> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer || !customer.creditLimit) {
      return false;
    }

    const creditLimit = parseFloat(customer.creditLimit.toString());
    return creditLimit >= amount;
  }

  /**
   * Business logic: Deduct credit from customer
   */
    async deductCredit(customerId: string, amount: number): Promise<boolean> {
        const customer = await this.customerRepository.findById(customerId);
        if (!customer || !customer.creditLimit) {
        return false;
        }
    
        const creditLimit = parseFloat(customer.creditLimit.toString());
        const newCredit = creditLimit - amount;
        if (newCredit < 0) {
        return false;
        }
    
        await this.customerRepository.update(customerId, { creditLimit: newCredit.toString() });
        return true;
    }

    /**
     * Business logic: Return users grouped by role
     */
    async groupByRole() {
        const customers = await this.customerRepository.findAll();
        const grouped = customers.reduce((acc, customer) => {
        const role = customer.role.name;
        if (!acc[role]) {
            acc[role] = [];
        }
        acc[role].push(customer);
        return acc;
        }, {} as Record<string, customer[]>);
        return grouped;
    }

  /**
   * Get customer name with proper formatting
   */
  formatCustomerName(customer: customer): string {
    if (customer.middleName) {
      return `${customer.firstName} ${customer.middleName} ${customer.lastName}`;
    } else {
      return `${customer.firstName} ${customer.lastName}`;
    }
  }
}