import { Context } from "npm:hono";
import { describeRoute } from "npm:hono-openapi";
import { resolver, validator as zValidator } from "npm:hono-openapi/zod";
import { z } from "npm:zod";
import { CustomerService } from "../../application/services/customer.service.ts";
import { ApiError, handleError } from "../../utils/error-handler.ts";
import {
  customerSchema,
  customerInfoSchema,
  createCustomerSchema,
  updateCustomerSchema
} from "../validators/user.validator.ts";

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  // Get all customers with pagination
  getAllCustomers = async (c: Context) => {
    try {
      // Parse pagination parameters
      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '10');
      
      const result = await this.customerService.getAllCustomers(page, limit);
      
      return c.json(result);
    } catch (error) {
      return handleError(c, error);
    }
  }

  // Get customer by UUID
  getCustomerById = async (c: Context) => {
    try {
      const { id } = c.req.param();
      const customer = await this.customerService.getCustomerById(id);
      
      if (!customer) {
        throw ApiError.notFound("Customer not found");
      }
      
      return c.json({ data: customer });
    } catch (error) {
      return handleError(c, error);
    }
  }

  createCustomer = async (c: Context) => {
    try {
      // Parse manually with the schema
      const body = await c.req.json();
      const validatedData = createCustomerSchema.parse(body);
      
      // Use validated data with service
      const result = await this.customerService.createCustomer(validatedData);
      
      return c.json({ data: result }, 201);
    } catch (error) {
      return handleError(c, error);
    }
  }

    // Update existing customer
    updateCustomer = async (c: Context) => {
      try {
        const { id } = c.req.param();
        const body = await c.req.json();
        const validatedData = updateCustomerSchema.parse(body);
        
        const result = await this.customerService.updateCustomer(id, validatedData);
        
        if (!result) {
          throw ApiError.notFound("Customer not found");
        }
        
        return c.json({ data: result });
      } catch (error) {
        return handleError(c, error);
      }
    }


    // Delete customer
    deleteCustomer = async (c: Context) => {
      try {
        const { id } = c.req.param();
        
        const success = await this.customerService.deleteCustomer(id);
        
        if (!success) {
          throw ApiError.notFound("Customer not found");
        }
        
        return c.json({ 
          success: true, 
          message: "Customer deleted successfully" 
        });
      } catch (error) {
        return handleError(c, error);
      }
    }

      // Get customers grouped by role
  getCustomersGroupedByRole = async (c: Context) => {
    try {
      const groupedCustomers = await this.customerService.groupByRole();
      
      return c.json({ data: groupedCustomers });
    } catch (error) {
      return handleError(c, error);
    }
  }

    // Check if a customer has sufficient credit
    checkCustomerCredit = async (c: Context) => {
      try {
        const { id } = c.req.param();
        const { amount } = await c.req.json();
        
        if (typeof amount !== 'number' || amount <= 0) {
          throw ApiError.badRequest("Amount must be a positive number");
        }
        
        const hasCredit = await this.customerService.hasCredit(id, amount);
        
        return c.json({ 
          hasCredit, 
          message: hasCredit 
            ? "Customer has sufficient credit" 
            : "Customer does not have sufficient credit" 
        });
      } catch (error) {
        return handleError(c, error);
      }
    }

      // Deduct credit from customer
  deductCustomerCredit = async (c: Context) => {
    try {
      const { id } = c.req.param();
      const { amount } = await c.req.json();
      
      if (typeof amount !== 'number' || amount <= 0) {
        throw ApiError.badRequest("Amount must be a positive number");
      }
      
      const success = await this.customerService.deductCredit(id, amount);
      
      if (!success) {
        return c.json({ 
          success: false, 
          message: "Insufficient credit or customer not found" 
        }, 400);
      }
      
      return c.json({ 
        success: true, 
        message: `Successfully deducted ${amount} from customer's credit` 
      });
    } catch (error) {
      return handleError(c, error);
    }
  }
}