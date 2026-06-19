import { IUser } from './user.model';
import mongoose, { Schema, Types } from "mongoose";

export interface IFriendship {
    userA: Types.ObjectId | IUser,
    userB: Types.ObjectId | IUser,
    createdAt: Date,
    updatedAt: Date
}

const friendshipSchema = new Schema<IFriendship>({
    userA: {
        type: Types.ObjectId ,
        required: true,
        ref: "User"
    },
    userB: {
        type: Types.ObjectId,
        required: true,
        ref: "User"
    },
    createdAt: Date,
    updatedAt: Date
}, {
    timestamps: true,
    strict: true,
    toJSON: { virtuals: true, },
    toObject: { virtuals: true, }
})

friendshipSchema.index({ userA: 1, userB: 1 }, { unique: true })
export const friendshipModel = mongoose.models.Friendship || mongoose.model<IFriendship>("Friendship", friendshipSchema);

