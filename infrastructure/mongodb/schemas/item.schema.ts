import { mongoose } from "../db.ts";

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

// Keep the Item model for direct operations if needed
export const Item = mongoose.model("Item", ItemSchema);
