import mongoose, { Document, model, Model, models, Schema } from "mongoose";

export interface IPost extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  imageUrl: string;
  imagePublicId: string;
  likeCount: number;
  commentCount: number;
  createdAt: number;
  updatedAt: number;
}

const postSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      required: [true, "Post content is requried"],
      trim: true,
      maxLength: [250, "Content cannot exceed 250 char"],
    },
    author: {
      type: Schema.Types.ObjectId,
      required: [true, "Author is required"],
      ref: "User",
      index: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

postSchema.index({createdAt: -1})

export const Post: Model<IPost> = models.Post || model<IPost>("Post", postSchema)