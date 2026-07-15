import mongoose, { Document, model, Model, models, Schema } from "mongoose";

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
}

const commentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: [true, "Comment is required"],
    trim: true,
    maxLength: [250, "Comment cannot exceed 250 char"],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
    index: true,
  },
});

commentSchema.index({ post: 1, createdAt: -1 });

export const Comment: Model<IComment> =
  models.Comment || model<IComment>("Comment", commentSchema);
