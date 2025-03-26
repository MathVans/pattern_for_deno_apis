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

// Indexes for better query performance
ProjectSchema.index({ code: 1 });
ProjectSchema.index({ status: 1 });

// Create models
export const Project = mongoose.model("Project", ProjectSchema);
