import mongoose, { Schema } from "mongoose";
import type { BoardDocument } from "../types/board.interface";
const boardSchema = new Schema<BoardDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model<BoardDocument>("Boards", boardSchema);
