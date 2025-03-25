import { Context } from "hono";
import { UserService } from "../../application/services/user.service.ts";
import { ApiError, handleError } from "../../utils/error-handler.ts";
import {
  createUserSchema,
  updateUserSchema,
} from "../validators/user.validator.ts";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Get all users with pagination
  getAllUsers = async (c: Context) => {
    try {
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("limit") || "10");

      const result = await this.userService.getAllUsers(page, limit);

      return c.json(result);
    } catch (error) {
      return handleError(c, error);
    }
  };

  // Get user by UUID
  getUserById = async (c: Context) => {
    try {
      const { id } = c.req.param();
      const user = await this.userService.getUserById(id);

      if (!user) {
        throw ApiError.notFound("User not found");
      }

      return c.json({ data: user });
    } catch (error) {
      return handleError(c, error);
    }
  };

  createUser = async (c: Context) => {
    try {
      const body = await c.req.json();
      const result = await this.userService.createUser(body);

      return c.json({ data: result }, 201);
    } catch (error) {
      return handleError(c, error);
    }
  };

  // Update existing user
  updateUser = async (c: Context) => {
    try {
      const { id } = c.req.param();
      const body = await c.req.json();

      const result = await this.userService.updateUser(
        id,
        body,
      );

      if (!result) {
        throw ApiError.notFound("User not found");
      }

      return c.json({ data: result });
    } catch (error) {
      return handleError(c, error);
    }
  };

  // Delete user
  deleteUser = async (c: Context) => {
    try {
      const { id } = c.req.param();

      const success = await this.userService.deleteUser(id);

      if (!success) {
        throw ApiError.notFound("User not found");
      }

      return c.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      return handleError(c, error);
    }
  };

  // Get users grouped by role
  getUsersGroupedByRole = async (c: Context) => {
    try {
      const groupedUsers = await this.userService.groupByRole();

      return c.json({ data: groupedUsers });
    } catch (error) {
      return handleError(c, error);
    }
  };

  // Check if a user has sufficient credit
  checkUserCredit = async (c: Context) => {
    try {
      const { id } = c.req.param();
      const { amount } = await c.req.json();

      if (typeof amount !== "number" || amount <= 0) {
        throw ApiError.badRequest("Amount must be a positive number");
      }

      const hasCredit = await this.userService.hasCredit(id, amount);

      return c.json({
        hasCredit,
        message: hasCredit
          ? "User has sufficient credit"
          : "User does not have sufficient credit",
      });
    } catch (error) {
      return handleError(c, error);
    }
  };

  // Deduct credit from user
  deductUserCredit = async (c: Context) => {
    try {
      const { id } = c.req.param();
      const { amount } = await c.req.json();

      if (typeof amount !== "number" || amount <= 0) {
        throw ApiError.badRequest("Amount must be a positive number");
      }

      const success = await this.userService.deductCredit(id, amount);

      if (!success) {
        return c.json({
          success: false,
          message: "Insufficient credit or user not found",
        }, 400);
      }

      return c.json({
        success: true,
        message: `Successfully deducted ${amount} from user's credit`,
      });
    } catch (error) {
      return handleError(c, error);
    }
  };
}
