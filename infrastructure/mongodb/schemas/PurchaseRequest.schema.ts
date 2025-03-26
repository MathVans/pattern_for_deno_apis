import { mongoose } from "../db.ts";
import { Item } from "./item.schema.ts";
// Define the item schema
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
    items: [Item],
    notes: { type: String },
    attachments: [{ type: String }],
  },
  { timestamps: true },
);

PurchaseRequestSchema.index({ requestNumber: 1 });
PurchaseRequestSchema.index({ projectId: 1 });
PurchaseRequestSchema.index({ status: 1 });
PurchaseRequestSchema.index({ requestDate: 1 });

export const PurchaseRequest = mongoose.model(
  "PurchaseRequest",
  PurchaseRequestSchema,
);
