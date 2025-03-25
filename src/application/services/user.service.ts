import {
  IUserRepository,
  UserRepository,
} from "../../../infrastructure/database/repositories/user.repository.ts";
import type {
  newUser,
  updateUser,
  user,
  userInfo,
} from "../../../infrastructure/database/schemas/user.ts";
import { ApiError } from "../../utils/error-handler.ts";

export class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  /**
   * Get all users with pagination support
   */
  async getAllUsers(page = 1, limit = 10) {
    return await this.userRepository.findPaginated(page, limit);
  }

  /**
   * Get a user by UUID with their addresses
   */
  async getUserById(uuid: string): Promise<userInfo | undefined> {
    return await this.userRepository.findWithAddresses(uuid);
  }

  /**
   * Create a new user with validation
   */
  async createUser(data: newUser): Promise<user> {
    // Business validation: check if email already exists
    const existingUser = await this.userRepository.findByEmail(
      data.email,
    );
    if (existingUser) {
      throw ApiError.conflict("Email already in use by another user");
    }

    // Business validation: validate credit limit
    if (data.creditLimit && parseFloat(data.creditLimit.toString()) < 0) {
      throw ApiError.validation("Credit limit cannot be negative");
    }

    // Create user
    return await this.userRepository.create(data);
  }

  /**
   * Update a user with validation
   */
  async updateUser(
    uuid: string,
    data: updateUser,
  ): Promise<user | undefined> {
    // Check if user exists
    const user = await this.userRepository.findById(uuid);
    if (!user) {
      throw new Error("User not found");
    }

    // If email is being updated, check for uniqueness
    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(
        data.email,
      );
      if (existingUser) {
        throw new Error("Email already in use by another user");
      }
    }

    // Business validation: validate credit limit
    if (data.creditLimit && parseFloat(data.creditLimit.toString()) < 0) {
      throw new Error("Credit limit cannot be negative");
    }

    return await this.userRepository.update(uuid, data);
  }

  /**
   * Delete a user
   */
  async deleteUser(uuid: string): Promise<boolean> {
    // Check if user exists
    const user = await this.userRepository.findById(uuid);
    if (!user) {
      throw new Error("User not found");
    }

    return await this.userRepository.delete(uuid);
  }

  /**
   * Business logic: Check if user has sufficient credit
   */
  async hasCredit(userId: string, amount: number): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.creditLimit) {
      return false;
    }

    const creditLimit = parseFloat(user.creditLimit.toString());
    return creditLimit >= amount;
  }

  /**
   * Business logic: Deduct credit from user
   */
  async deductCredit(userId: string, amount: number): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.creditLimit) {
      return false;
    }

    const creditLimit = parseFloat(user.creditLimit.toString());
    const newCredit = creditLimit - amount;
    if (newCredit < 0) {
      return false;
    }

    await this.userRepository.update(userId, {
      creditLimit: newCredit.toString(),
    });
    return true;
  }

  /**
   * Business logic: Return users grouped by role
   */
  async groupByRole() {
    const users = await this.userRepository.findAll();
    const grouped = users.reduce(
      (acc: { [x: string]: any[] }, user: { role: { name: any } }) => {
        const role = user.role.name;
        if (!acc[role]) {
          acc[role] = [];
        }
        acc[role].push(user);
        return acc;
      },
      {} as Record<string, user[]>,
    );
    return grouped;
  }

  /**
   * Get user name with proper formatting
   */
  formatUserName(user: user): string {
    if (user.middleName) {
      return `${user.firstName} ${user.middleName} ${user.lastName}`;
    } else {
      return `${user.firstName} ${user.lastName}`;
    }
  }
}
