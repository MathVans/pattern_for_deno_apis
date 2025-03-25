import { mongoose } from "../db.ts";

// Create schemas
const ProjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    budget: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["planning", "active", "on-hold", "completed", "cancelled"],
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    manager: { type: String },
    department: { type: String },
    tags: [{ type: String }],
    metadata: { type: Object },
  },
  { timestamps: true },
);

// Create a catalog item schema
const CatalogItemSchema = new mongoose.Schema(
  {
    itemCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    defaultUnit: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    supplier: { type: String },
    category: { type: String },
    specifications: { type: Object },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Update the ItemSchema to include a reference to catalog item
const ItemSchema = new mongoose.Schema({
  catalogItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CatalogItem",
  },
  name: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  supplier: { type: String },
  category: { type: String },
  specifications: { type: Object },
});
// Purchase Request schema
const PurchaseRequestSchema = new mongoose.Schema(
  {
    requestNumber: { type: String, required: true, unique: true },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: { type: String, required: true },
    requestDate: { type: Date, required: true, default: Date.now },
    requesterName: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "processing",
        "completed",
      ],
    },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "critical"],
    },
    approvedBy: { type: String },
    approvalDate: { type: Date },
    totalAmount: { type: Number, required: true },
    currency: { type: String, required: true, default: "BRL" },
    items: [ItemSchema],
    notes: { type: String },
    attachments: [{ type: String }],
  },
  { timestamps: true },
);

// Indexes for better query performance
ProjectSchema.index({ code: 1 });
ProjectSchema.index({ status: 1 });
PurchaseRequestSchema.index({ requestNumber: 1 });
PurchaseRequestSchema.index({ projectId: 1 });
PurchaseRequestSchema.index({ status: 1 });
PurchaseRequestSchema.index({ requestDate: 1 });

// Add indexes to the catalog item schema
CatalogItemSchema.index({ itemCode: 1 });
CatalogItemSchema.index({ name: 1 });
CatalogItemSchema.index({ category: 1 });
CatalogItemSchema.index({ supplier: 1 });

// Create models
export const Project = mongoose.model("Project", ProjectSchema);
export const PurchaseRequest = mongoose.model(
  "PurchaseRequest",
  PurchaseRequestSchema,
);
export const CatalogItem = mongoose.model(
  "CatalogItem",
  CatalogItemSchema,
);
// Keep the Item model for direct operations if needed
export const Item = mongoose.model("Item", ItemSchema);
