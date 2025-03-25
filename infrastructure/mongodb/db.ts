import mongoose from "npm:mongoose";

class MongooseConnection {
  private static instance: MongooseConnection;
  private isConnected = false;

  private constructor() {
    // Private constructor to enforce singleton
    mongoose.set("strictQuery", true);
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MongooseConnection {
    if (!MongooseConnection.instance) {
      MongooseConnection.instance = new MongooseConnection();
    }
    return MongooseConnection.instance;
  }

  /**
   * Connect to MongoDB using Mongoose
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("🔄 MongoDB connection already established");
      return;
    }

    try {
      const uri = Deno.env.get("MONGODB_URI");
      if (!uri) {
        throw new Error("MONGODB_URI environment variable is not set");
      }

      // Connect to MongoDB
      await mongoose.connect(uri, {
        dbName: Deno.env.get("MONGODB_DB_NAME") || "deno_api_db",
      });

      this.isConnected = true;
      console.log(
        "✅ MongoDB connection established successfully via Mongoose",
      );
    } catch (error) {
      console.error("❌ Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  /**
   * Close the MongoDB connection
   */
  public async close(): Promise<void> {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("🔒 MongoDB connection closed");
    }
  }

  /**
   * Check if connected to MongoDB
   */
  public get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Get the Mongoose instance
   */
  public getMongoose(): typeof mongoose {
    return mongoose;
  }
}

// Export the singleton instance
export const mongoDb = MongooseConnection.getInstance();

// Export mongoose for schema definitions
export { mongoose };
