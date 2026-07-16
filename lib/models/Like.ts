import mongoose, { Document, model, Model, models, Schema } from "mongoose";

export interface ILike extends Document {
  user: mongoose.Types.ObjectId,
  post: mongoose.Types.ObjectId,
  createdAt: Date 
}

const likeSchema = new Schema<ILike>({
  user: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  post: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
    required: true
  },
}, {timestamps: {createdAt: true, updatedAt: false}})

likeSchema.index({user: 1, post: 1}, {unique: true})

export const Like: Model<ILike> = models.Like|| model<ILike>("Like", likeSchema)