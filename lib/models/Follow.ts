import mongoose, { Document, model, Model, models, Schema } from "mongoose";

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
}

const followSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      types: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

followSchema.index({follower: 1, following: 1}, {unique: true})
followSchema.index({following: 1})

export const Follow: Model<IFollow> = models.Follow || model<IFollow>("Follow", followSchema)