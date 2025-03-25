import { load } from "@std/dotenv";
import { mongoDb } from "../db.ts";
import { CatalogItem, Project, PurchaseRequest } from "../schemas/schema.ts";

// Load environment variables
await load({ export: true });
await load({ export: true });

/**
 * Seed project data
 */
async function seedProjects() {
  console.log("🌱 Seeding projects...");

  // Check if projects already exist
  const existingProjects = await Project.countDocuments();

  if (existingProjects > 0) {
    console.log("✓ Projects already seeded, skipping.");
    return await Project.find();
  }

  // Insert projects
  const projects = await Project.create([
    {
      code: "PRJ-2023-001",
      name: "Office Renovation",
      description: "Headquarter office renovation project",
      budget: 250000,
      status: "active",
      startDate: new Date("2023-09-01"),
      endDate: new Date("2023-12-31"),
      manager: "John Smith",
      department: "Facilities",
      tags: ["renovation", "office", "high-priority"],
    },
    {
      code: "PRJ-2023-002",
      name: "IT Infrastructure Upgrade",
      description: "Upgrade company servers and network equipment",
      budget: 175000,
      status: "planning",
      startDate: new Date("2023-11-15"),
      manager: "Sarah Johnson",
      department: "IT",
      tags: ["infrastructure", "network", "servers"],
    },
    {
      code: "PRJ-2023-003",
      name: "Product Launch Campaign",
      description: "Marketing campaign for new product line",
      budget: 120000,
      status: "active",
      startDate: new Date("2023-10-01"),
      endDate: new Date("2023-12-15"),
      manager: "Michael Brown",
      department: "Marketing",
      tags: ["marketing", "launch", "campaign"],
    },
  ]);

  console.log(`✅ ${projects.length} projects seeded successfully!`);
  return projects;
}

/**
 * Seed catalog items
 */
async function seedCatalogItems() {
  console.log("🌱 Seeding catalog items...");

  // Check if catalog items already exist
  const existingItems = await CatalogItem.countDocuments();

  if (existingItems > 0) {
    console.log("✓ Catalog items already seeded, skipping.");
    return await CatalogItem.find();
  }

  // Insert catalog items
  const catalogItems = await CatalogItem.create([
    {
      itemCode: "FURN-001",
      name: "Executive Desk",
      description: "High quality executive desk with drawers",
      defaultUnit: "unit",
      unitPrice: 1200,
      supplier: "Office Solutions Inc.",
      category: "Furniture",
      isActive: true,
      specifications: {
        dimensions: "180x80x75 cm",
        material: "Oak wood",
        color: "Dark brown",
      },
    },
    {
      itemCode: "FURN-002",
      name: "Office Chair",
      description: "Ergonomic office chair with adjustable height",
      defaultUnit: "unit",
      unitPrice: 350,
      supplier: "Office Solutions Inc.",
      category: "Furniture",
      isActive: true,
      specifications: {
        dimensions: "65x65x110 cm",
        material: "Mesh and metal",
        color: "Black",
      },
    },
    {
      itemCode: "IT-001",
      name: "Dell XPS Laptop",
      description: "Dell XPS 15 laptop with 16GB RAM",
      defaultUnit: "unit",
      unitPrice: 1800,
      supplier: "Tech Supplies Ltd.",
      category: "IT Equipment",
      isActive: true,
      specifications: {
        processor: "Intel i7",
        ram: "16GB",
        storage: "512GB SSD",
        os: "Windows 11",
      },
    },
    {
      itemCode: "IT-002",
      name: 'Monitor 24"',
      description: "24-inch LED monitor",
      defaultUnit: "unit",
      unitPrice: 250,
      supplier: "Tech Supplies Ltd.",
      category: "IT Equipment",
      isActive: true,
      specifications: {
        resolution: "1920x1080",
        refreshRate: "75Hz",
        connectivity: "HDMI, DisplayPort",
      },
    },
    {
      itemCode: "SUP-001",
      name: "Printer Paper",
      description: "A4 printer paper, 80gsm",
      defaultUnit: "ream",
      unitPrice: 5,
      supplier: "Office Depot",
      category: "Office Supplies",
      isActive: true,
      specifications: {
        size: "A4",
        weight: "80gsm",
        sheets: "500 per ream",
      },
    },
  ]);

  console.log(`✅ ${catalogItems.length} catalog items seeded successfully!`);
  return catalogItems;
}

/**
 * Seed purchase requests
 */
async function seedPurchaseRequests(projects: any, catalogItems: any) {
  console.log("🌱 Seeding purchase requests...");

  // Check if purchase requests already exist
  const existingRequests = await PurchaseRequest.countDocuments();

  if (existingRequests > 0) {
    console.log("✓ Purchase requests already seeded, skipping.");
    return;
  }

  // Helper to create request numbers with sequential IDs
  function createRequestNumber(index: number): string {
    return `REQ-${new Date().getFullYear()}-${
      String(index + 1).padStart(3, "0")
    }`;
  }

  // Helper to create items for a purchase request from catalog items
  function createItemsFromCatalog(catalogItems: any, count = 3) {
    const items = [];
    const selectedItems = [...catalogItems].sort(() => 0.5 - Math.random())
      .slice(0, count);

    for (const item of selectedItems) {
      const quantity = Math.floor(Math.random() * 5) + 1;
      items.push({
        catalogItemId: item._id,
        name: item.name,
        description: item.description,
        quantity: quantity,
        unit: item.defaultUnit,
        unitPrice: item.unitPrice,
        totalPrice: quantity * item.unitPrice,
        supplier: item.supplier,
        category: item.category,
        specifications: item.specifications,
      });
    }

    return items;
  }

  // Calculate total amount for a list of items
  function calculateTotal(items: any) {
    return items.reduce((sum: any, item: any) => sum + item.totalPrice, 0);
  }

  // Create purchase requests
  const requestsData = [
    {
      title: "Office furniture for renovation",
      requesterName: "Emily Davis",
      status: "approved",
      priority: "medium",
      approvedBy: "John Smith",
      approvalDate: new Date(),
      currency: "USD",
      notes: "Deliver to 3rd floor, east wing",
    },
    {
      title: "IT equipment for new hires",
      requesterName: "David Wilson",
      status: "pending",
      priority: "high",
      currency: "USD",
      notes: "Needed by end of month",
    },
    {
      title: "teste",
      requesterName: "Sarah Johnson",
      status: "processing",
      priority: "low",
      approvedBy: "Michael Brown",
      approvalDate: new Date(),
    },
    {
      title: "Conference room equipment",
      requesterName: "Robert Miller",
      status: "draft",
      priority: "medium",
      currency: "USD",
    },
  ];

  // Map projects and create final purchase request objects with items
  const purchaseRequests = await Promise.all(
    requestsData.map(async (data, index) => {
      // Choose a project for this request
      const project = projects[index % projects.length];

      // Create items for this request
      const items = createItemsFromCatalog(
        catalogItems,
        Math.floor(Math.random() * 3) + 1,
      );
      const totalAmount = calculateTotal(items);

      // Create the purchase request
      return await PurchaseRequest.create({
        requestNumber: createRequestNumber(index),
        projectId: project._id, // Fixed the syntax error
        title: data.title,
        requestDate: new Date(),
        requesterName: data.requesterName,
        status: data.status,
        priority: data.priority,
        approvedBy: data.approvedBy,
        approvalDate: data.approvalDate,
        totalAmount,
        currency: data.currency,
        items,
        notes: data.notes,
      });
    }),
  );

  console.log(
    `✅ ${purchaseRequests.length} purchase requests seeded successfully!`,
  );
}

/**
 * Main function to execute all seeds
 */
async function main() {
  try {
    console.log("🚀 Starting MongoDB seed process...");

    // Connect to MongoDB
    await mongoDb.connect();

    // Execute seeds in correct order (respecting foreign keys)
    const projects = await seedProjects();
    const catalogItems = await seedCatalogItems();
    await seedPurchaseRequests(projects, catalogItems);

    console.log("✨ MongoDB seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding MongoDB:", error);
  } finally {
    // Close MongoDB connection
    await mongoDb.close();
  }
}

// Execute the seed if this file is run directly
if (import.meta.main) {
  await main();
}

// Export functions for use in other modules if needed
export { seedCatalogItems, seedProjects, seedPurchaseRequests };
