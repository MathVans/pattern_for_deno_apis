import { mongoose } from "../db.ts";

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

// Add indexes to the catalog item schema
CatalogItemSchema.index({ itemCode: 1 });
CatalogItemSchema.index({ name: 1 });
CatalogItemSchema.index({ category: 1 });
CatalogItemSchema.index({ supplier: 1 });

export const CatalogItem = mongoose.model(
  "CatalogItem",
  CatalogItemSchema,
);
