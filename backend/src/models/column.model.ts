import mongoose, { Schema } from "mongoose";

const columnSchema = new Schema({
  boardId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
  },
  position: {
    type: Number,
    default: 1,
  },
});

export default mongoose.model("Column", columnSchema);
